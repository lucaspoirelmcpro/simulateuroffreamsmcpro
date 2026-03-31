import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, apiError, apiSuccess } from '@/lib/api-helpers'
import { z } from 'zod'

const createContactSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  orgId: z.string().optional().nullable(),
  ownerId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
  pipelineId: z.string().optional(), // Add to pipeline on creation
})

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')
  const ownerId = searchParams.get('ownerId')
  const orgId = searchParams.get('orgId')
  const pipelineId = searchParams.get('pipelineId')
  const stageId = searchParams.get('stageId')
  const page = parseInt(searchParams.get('page') ?? '1')
  const pageSize = parseInt(searchParams.get('pageSize') ?? '50')

  const where: Record<string, any> = {}

  if (search) {
    where.OR = [
      { firstname: { contains: search, mode: 'insensitive' } },
      { lastname: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { org: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }
  if (ownerId) where.ownerId = ownerId
  if (orgId) where.orgId = orgId
  if (pipelineId) {
    where.pipelineStates = {
      some: {
        pipelineId,
        ...(stageId ? { currentStageId: stageId } : {}),
      },
    }
  }

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: {
        org: true,
        owner: { select: { id: true, name: true, image: true } },
        pipelineStates: {
          include: {
            currentStage: true,
            pipeline: true,
          },
        },
        metricsSnapshots: true,
        sellsyLinks: true,
        _count: {
          select: { interactions: true, tasks: true, notes: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contact.count({ where }),
  ])

  return apiSuccess({ data: contacts, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  const body = await req.json()
  const parsed = createContactSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.message)
  }

  const { pipelineId, ...data } = parsed.data

  const contact = await prisma.contact.create({
    data: {
      ...data,
      tags: data.tags ?? [],
      source: data.source ?? 'MANUAL',
    },
  })

  // Add to pipeline if specified
  if (pipelineId) {
    const pipeline = await prisma.pipeline.findUnique({
      where: { id: pipelineId },
      include: { stages: { orderBy: { order: 'asc' }, take: 1 } },
    })
    if (pipeline?.stages[0]) {
      await prisma.contactPipelineState.create({
        data: {
          contactId: contact.id,
          pipelineId,
          currentStageId: pipeline.stages[0].id,
          status: 'OPEN',
        },
      })
      // Log stage history
      await prisma.contactStageHistory.create({
        data: {
          contactId: contact.id,
          pipelineId,
          toStageId: pipeline.stages[0].id,
          changedByUserId: session!.user.id,
          reason: 'Contact créé',
        },
      })
      // Log event
      await prisma.event.create({
        data: {
          type: 'contact_created',
          contactId: contact.id,
          userId: session!.user.id,
          payloadJson: { pipelineId, stageId: pipeline.stages[0].id },
        },
      })
    }
  }

  return apiSuccess(contact, 201)
}
