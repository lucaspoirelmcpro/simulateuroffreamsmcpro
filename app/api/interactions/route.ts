import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, apiError, apiSuccess } from '@/lib/api-helpers'
import { z } from 'zod'
import { recomputeMetrics } from '@/lib/metrics'

const createInteractionSchema = z.object({
  contactId: z.string().optional(),
  orgId: z.string().optional(),
  type: z.enum(['EMAIL_OUT', 'EMAIL_IN', 'CALL', 'MEETING', 'DEMO', 'WHATSAPP', 'LINKEDIN', 'NOTE', 'SELLSY_EVENT', 'STAGE_CHANGE']),
  occurredAt: z.string().datetime(),
  summary: z.string().optional(),
  source: z.enum(['MANUAL', 'GMAIL', 'SELLSY', 'SYSTEM']).optional(),
  externalId: z.string().optional(),
  payloadJson: z.any().optional(),
})

export async function GET(req: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const contactId = searchParams.get('contactId')
  const orgId = searchParams.get('orgId')
  const type = searchParams.get('type')
  const page = parseInt(searchParams.get('page') ?? '1')
  const pageSize = parseInt(searchParams.get('pageSize') ?? '50')

  const where: Record<string, any> = {}
  if (contactId) where.contactId = contactId
  if (orgId) where.orgId = orgId
  if (type) where.type = type

  const [interactions, total] = await Promise.all([
    prisma.interaction.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.interaction.count({ where }),
  ])

  return apiSuccess({ data: interactions, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  const body = await req.json()
  const parsed = createInteractionSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message)

  const interaction = await prisma.interaction.create({
    data: {
      ...parsed.data,
      occurredAt: new Date(parsed.data.occurredAt),
      source: parsed.data.source ?? 'MANUAL',
    },
  })

  // Update contact lastActivityAt
  if (interaction.contactId) {
    await prisma.contactPipelineState.updateMany({
      where: { contactId: interaction.contactId },
      data: { lastActivityAt: new Date(parsed.data.occurredAt) },
    })
    // Recompute metrics
    recomputeMetrics(interaction.contactId).catch(console.error)
  }

  return apiSuccess(interaction, 201)
}
