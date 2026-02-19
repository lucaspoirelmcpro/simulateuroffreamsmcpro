import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, apiError, apiSuccess } from '@/lib/api-helpers'
import { z } from 'zod'
import { recomputeMetrics } from '@/lib/metrics'
import { differenceInDays } from 'date-fns'

const stageChangeSchema = z.object({
  pipelineId: z.string(),
  stageId: z.string(),
  reason: z.string().optional(),
  status: z.enum(['OPEN', 'WON', 'LOST']).optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireAuth()
  if (error) return error

  const body = await req.json()
  const parsed = stageChangeSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message)

  const { pipelineId, stageId, reason, status } = parsed.data

  // Get current state
  const currentState = await prisma.contactPipelineState.findUnique({
    where: { contactId_pipelineId: { contactId: params.id, pipelineId } },
    include: { currentStage: true },
  })

  if (!currentState) {
    // Create new state
    const state = await prisma.contactPipelineState.create({
      data: {
        contactId: params.id,
        pipelineId,
        currentStageId: stageId,
        status: status ?? 'OPEN',
        lastActivityAt: new Date(),
      },
    })
    await prisma.contactStageHistory.create({
      data: {
        contactId: params.id,
        pipelineId,
        toStageId: stageId,
        changedByUserId: session!.user.id,
        reason,
      },
    })
    return apiSuccess(state)
  }

  const fromStageId = currentState.currentStageId
  const changedAt = new Date()

  // Calculate days in previous stage
  const daysInPrevStage = currentState.updatedAt
    ? differenceInDays(changedAt, currentState.updatedAt)
    : null

  // Update state
  const updatedState = await prisma.contactPipelineState.update({
    where: { contactId_pipelineId: { contactId: params.id, pipelineId } },
    data: {
      currentStageId: stageId,
      status: status ?? currentState.status,
      lastActivityAt: changedAt,
    },
    include: { currentStage: true },
  })

  // Write history
  await prisma.contactStageHistory.create({
    data: {
      contactId: params.id,
      pipelineId,
      fromStageId,
      toStageId: stageId,
      changedByUserId: session!.user.id,
      changedAt,
      reason,
      daysInPrevStage,
    },
  })

  // Create interaction
  await prisma.interaction.create({
    data: {
      contactId: params.id,
      type: 'STAGE_CHANGE',
      occurredAt: changedAt,
      source: 'SYSTEM',
      summary: reason ?? 'Stage changé',
      payloadJson: { fromStageId, toStageId: stageId },
    },
  })

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId: session!.user.id,
      action: 'STAGE_CHANGE',
      resourceType: 'ContactPipelineState',
      resourceId: params.id,
      before: { stageId: fromStageId } as any,
      after: { stageId } as any,
    },
  })

  // Log event for analytics
  await prisma.event.create({
    data: {
      type: 'stage_changed',
      contactId: params.id,
      userId: session!.user.id,
      payloadJson: { fromStageId, toStageId: stageId, pipelineId, daysInPrevStage },
    },
  })

  // Recompute metrics async
  recomputeMetrics(params.id, pipelineId).catch(console.error)

  return apiSuccess(updatedState)
}
