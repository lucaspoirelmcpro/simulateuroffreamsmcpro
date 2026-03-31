import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, apiError, apiSuccess } from '@/lib/api-helpers'
import { z } from 'zod'

const createStageSchema = z.object({
  pipelineId: z.string(),
  name: z.string().min(1),
  order: z.number().int().min(0),
  color: z.string().optional(),
  requiresOwner: z.boolean().optional(),
  requiresNextStep: z.boolean().optional(),
  requiresEmail: z.boolean().optional(),
  rulesJson: z.any().optional(),
})

export async function POST(req: NextRequest) {
  const { error } = await requireRole('ADMIN')
  if (error) return error

  const body = await req.json()
  const parsed = createStageSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message)

  const stage = await prisma.pipelineStage.create({
    data: {
      ...parsed.data,
      color: parsed.data.color ?? '#6366f1',
    },
  })

  return apiSuccess(stage, 201)
}
