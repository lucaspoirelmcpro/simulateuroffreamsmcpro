import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole, apiError, apiSuccess } from '@/lib/api-helpers'
import { z } from 'zod'

const createPipelineSchema = z.object({
  name: z.string().min(1),
  stageType: z.enum(['PROSPECTING', 'RENEWAL', 'PARTNERSHIP']).default('PROSPECTING'),
  isDefault: z.boolean().optional(),
  staleAfterDays: z.number().optional(),
})

export async function GET(req: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error

  const pipelines = await prisma.pipeline.findMany({
    include: {
      stages: {
        orderBy: { order: 'asc' },
      },
      _count: { select: { contactStates: true } },
    },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  })

  return apiSuccess(pipelines)
}

export async function POST(req: NextRequest) {
  const { error } = await requireRole('ADMIN')
  if (error) return error

  const body = await req.json()
  const parsed = createPipelineSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message)

  const pipeline = await prisma.pipeline.create({
    data: {
      ...parsed.data,
      stages: {
        create: [
          { name: 'Prospect', order: 0, color: '#94a3b8', isDefault: true },
          { name: 'Contacté', order: 1, color: '#60a5fa' },
          { name: 'Qualification', order: 2, color: '#a78bfa' },
          { name: 'Démo planifiée', order: 3, color: '#f59e0b', requiresNextStep: true },
          { name: 'Proposition', order: 4, color: '#f97316' },
          { name: 'Négociation', order: 5, color: '#ef4444' },
          { name: 'Gagné', order: 6, color: '#22c55e' },
          { name: 'Perdu', order: 7, color: '#6b7280' },
        ],
      },
    },
    include: { stages: { orderBy: { order: 'asc' } } },
  })

  return apiSuccess(pipeline, 201)
}
