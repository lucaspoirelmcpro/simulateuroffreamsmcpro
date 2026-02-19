import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, apiError, apiSuccess } from '@/lib/api-helpers'
import { z } from 'zod'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth()
  if (error) return error

  const contact = await prisma.contact.findUnique({
    where: { id: params.id },
    include: {
      org: true,
      owner: { select: { id: true, name: true, image: true, email: true } },
      pipelineStates: {
        include: {
          currentStage: true,
          pipeline: true,
        },
      },
      stageHistory: {
        include: {
          fromStage: true,
          toStage: true,
          changedBy: { select: { id: true, name: true, image: true } },
        },
        orderBy: { changedAt: 'desc' },
        take: 20,
      },
      interactions: {
        orderBy: { occurredAt: 'desc' },
        take: 50,
      },
      emailThreads: {
        orderBy: { lastMessageAt: 'desc' },
        take: 20,
      },
      tasks: {
        where: { status: { not: 'CANCELLED' } },
        include: { owner: { select: { id: true, name: true, image: true } } },
        orderBy: { dueDate: 'asc' },
      },
      notes: {
        include: { author: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
      },
      metricsSnapshots: true,
      sellsyLinks: true,
      _count: {
        select: { interactions: true, tasks: true, notes: true },
      },
    },
  })

  if (!contact) return apiError('Contact not found', 404)
  return apiSuccess(contact)
}

const updateSchema = z.object({
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  orgId: z.string().optional().nullable(),
  ownerId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireAuth()
  if (error) return error

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message)

  const before = await prisma.contact.findUnique({ where: { id: params.id } })
  if (!before) return apiError('Contact not found', 404)

  const contact = await prisma.contact.update({
    where: { id: params.id },
    data: parsed.data,
  })

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session!.user.id,
      action: 'CONTACT_UPDATE',
      resourceType: 'Contact',
      resourceId: params.id,
      before: before as any,
      after: contact as any,
    },
  })

  return apiSuccess(contact)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireAuth()
  if (error) return error

  await prisma.contact.delete({ where: { id: params.id } })
  return apiSuccess({ deleted: true })
}
