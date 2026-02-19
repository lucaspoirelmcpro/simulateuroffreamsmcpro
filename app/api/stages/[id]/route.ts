import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, apiError, apiSuccess } from '@/lib/api-helpers'
import { z } from 'zod'

const updateStageSchema = z.object({
  name: z.string().min(1).optional(),
  order: z.number().int().min(0).optional(),
  color: z.string().optional(),
  requiresOwner: z.boolean().optional(),
  requiresNextStep: z.boolean().optional(),
  requiresEmail: z.boolean().optional(),
  rulesJson: z.any().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireRole('ADMIN')
  if (error) return error

  const body = await req.json()
  const parsed = updateStageSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message)

  const stage = await prisma.pipelineStage.update({
    where: { id: params.id },
    data: parsed.data,
  })

  return apiSuccess(stage)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireRole('ADMIN')
  if (error) return error

  // Check no contacts are in this stage
  const count = await prisma.contactPipelineState.count({
    where: { currentStageId: params.id },
  })
  if (count > 0) {
    return apiError(`Ce stage contient ${count} contact(s). Déplacez-les d'abord.`, 400)
  }

  await prisma.pipelineStage.delete({ where: { id: params.id } })
  return apiSuccess({ deleted: true })
}
