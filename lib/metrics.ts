import { prisma } from './prisma'
import { differenceInDays, subDays } from 'date-fns'

const INTERACTIONS_WINDOW_DAYS = 90
const DEMOS_WINDOW_DAYS = 180

/**
 * Recompute MetricsSnapshot for a contact + pipeline.
 * Called after stage changes, interaction writes, gmail/sellsy syncs.
 */
export async function recomputeMetrics(
  contactId: string,
  pipelineId?: string
): Promise<void> {
  const now = new Date()
  const window90 = subDays(now, INTERACTIONS_WINDOW_DAYS)
  const window180 = subDays(now, DEMOS_WINDOW_DAYS)

  // Fetch interactions
  const interactions = await prisma.interaction.findMany({
    where: {
      contactId,
      occurredAt: { gte: window180 },
    },
    orderBy: { occurredAt: 'desc' },
  })

  const interactions90 = interactions.filter(
    (i) => i.occurredAt >= window90
  )

  const emailsOut = interactions90.filter((i) => i.type === 'EMAIL_OUT')
  const emailsIn = interactions90.filter((i) => i.type === 'EMAIL_IN')
  const meetings = interactions90.filter((i) => i.type === 'MEETING')
  const demos = interactions.filter(
    (i) => i.type === 'DEMO' && i.occurredAt >= window180
  )
  const calls = interactions90.filter((i) => i.type === 'CALL')

  // Key dates
  const lastInteraction = interactions[0]?.occurredAt ?? null
  const lastEmailOut = emailsOut[0]?.occurredAt ?? null
  const lastEmailIn = emailsIn[0]?.occurredAt ?? null
  const lastMeeting = meetings[0]?.occurredAt ?? null
  const lastDemo = demos[0]?.occurredAt ?? null

  // Reply detection: EMAIL_IN after last EMAIL_OUT
  const replyDetected =
    lastEmailOut && lastEmailIn
      ? new Date(lastEmailIn) > new Date(lastEmailOut)
      : false

  const lastReplyAt =
    replyDetected && lastEmailIn ? new Date(lastEmailIn) : null

  // Days since last activity
  const daysSinceLastActivity = lastInteraction
    ? differenceInDays(now, new Date(lastInteraction))
    : null

  // Stale flag (get pipeline config)
  let staleAfterDays = 14
  if (pipelineId) {
    const pipeline = await prisma.pipeline.findUnique({
      where: { id: pipelineId },
      select: { staleAfterDays: true },
    })
    if (pipeline) staleAfterDays = pipeline.staleAfterDays
  }
  const staleFlag =
    daysSinceLastActivity !== null && daysSinceLastActivity > staleAfterDays

  // Next step missing
  let nextStepMissing = false
  if (pipelineId) {
    const state = await prisma.contactPipelineState.findUnique({
      where: { contactId_pipelineId: { contactId, pipelineId } },
      include: { currentStage: true },
    })
    if (state?.currentStage?.requiresNextStep) {
      nextStepMissing = !state.nextStepAt || !state.nextStepType
    }
  }

  // Next meeting from tasks
  const nextMeetingTask = await prisma.task.findFirst({
    where: {
      contactId,
      type: 'MEETING',
      status: 'OPEN',
      dueDate: { gte: now },
    },
    orderBy: { dueDate: 'asc' },
  })
  const nextMeetingAt = nextMeetingTask?.dueDate ?? null

  // Sellsy data
  const sellsyLink = await prisma.sellsyLink.findFirst({
    where: { contactId },
  })

  const data = {
    interactionsCount: interactions90.length,
    emailsOutCount: emailsOut.length,
    emailsInCount: emailsIn.length,
    meetingsCount: meetings.length,
    demosCount: demos.length,
    callsCount: calls.length,
    lastInteractionAt: lastInteraction ? new Date(lastInteraction) : null,
    lastEmailAt:
      lastEmailOut || lastEmailIn
        ? new Date(
            Math.max(
              lastEmailOut ? new Date(lastEmailOut).getTime() : 0,
              lastEmailIn ? new Date(lastEmailIn).getTime() : 0
            )
          )
        : null,
    lastEmailOutAt: lastEmailOut ? new Date(lastEmailOut) : null,
    lastEmailInAt: lastEmailIn ? new Date(lastEmailIn) : null,
    lastMeetingAt: lastMeeting ? new Date(lastMeeting) : null,
    lastDemoAt: lastDemo ? new Date(lastDemo) : null,
    nextMeetingAt,
    replyDetected,
    lastReplyAt,
    daysSinceLastActivity,
    staleFlag,
    nextStepMissing,
    sellsyStage: sellsyLink?.sellsyStage ?? null,
    sellsyAmount: sellsyLink?.amount ?? null,
    sellsyCloseDate: sellsyLink?.closeDate ?? null,
    updatedAt: now,
  }

  // Upsert snapshot
  if (pipelineId) {
    await prisma.metricsSnapshot.upsert({
      where: { contactId_pipelineId: { contactId, pipelineId } },
      create: { contactId, pipelineId, ...data },
      update: data,
    })
  } else {
    // Upsert without pipeline (global contact metrics)
    const existing = await prisma.metricsSnapshot.findFirst({
      where: { contactId, pipelineId: null },
    })
    if (existing) {
      await prisma.metricsSnapshot.update({
        where: { id: existing.id },
        data,
      })
    } else {
      await prisma.metricsSnapshot.create({
        data: { contactId, ...data },
      })
    }
  }
}

/**
 * Batch recompute all metrics snapshots (for cron)
 */
export async function recomputeAllMetrics(): Promise<void> {
  const contacts = await prisma.contact.findMany({
    select: { id: true, pipelineStates: { select: { pipelineId: true } } },
  })

  for (const contact of contacts) {
    for (const state of contact.pipelineStates) {
      await recomputeMetrics(contact.id, state.pipelineId)
    }
    if (contact.pipelineStates.length === 0) {
      await recomputeMetrics(contact.id)
    }
  }
}
