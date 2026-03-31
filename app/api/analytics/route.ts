import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, apiSuccess } from '@/lib/api-helpers'
import { subDays } from 'date-fns'

export async function GET(req: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const pipelineId = searchParams.get('pipelineId')
  const ownerId = searchParams.get('ownerId')
  const days = parseInt(searchParams.get('days') ?? '90')

  const since = subDays(new Date(), days)

  // Funnel metrics: contacts per stage
  const pipeline = pipelineId
    ? await prisma.pipeline.findUnique({
        where: { id: pipelineId },
        include: { stages: { orderBy: { order: 'asc' } } },
      })
    : await prisma.pipeline.findFirst({
        where: { isDefault: true },
        include: { stages: { orderBy: { order: 'asc' } } },
      })

  if (!pipeline) return apiSuccess({ funnel: [], emailMetrics: {}, ownerPerformance: [] })

  // Funnel: count contacts per stage
  const funnel = await Promise.all(
    pipeline.stages.map(async (stage) => {
      const count = await prisma.contactPipelineState.count({
        where: {
          pipelineId: pipeline.id,
          currentStageId: stage.id,
          status: 'OPEN',
          ...(ownerId ? { contact: { ownerId } } : {}),
        },
      })
      return {
        stageId: stage.id,
        stageName: stage.name,
        stageColor: stage.color,
        count,
      }
    })
  )

  // Stage conversion: history in period
  const stageChanges = await prisma.contactStageHistory.findMany({
    where: {
      pipelineId: pipeline.id,
      changedAt: { gte: since },
      daysInPrevStage: { not: null },
    },
    select: {
      toStageId: true,
      fromStageId: true,
      daysInPrevStage: true,
    },
  })

  // Avg days per stage
  const avgDaysPerStage: Record<string, number> = {}
  const countPerStage: Record<string, number> = {}
  for (const change of stageChanges) {
    if (change.fromStageId && change.daysInPrevStage !== null) {
      if (!avgDaysPerStage[change.fromStageId]) {
        avgDaysPerStage[change.fromStageId] = 0
        countPerStage[change.fromStageId] = 0
      }
      avgDaysPerStage[change.fromStageId] += change.daysInPrevStage
      countPerStage[change.fromStageId]++
    }
  }
  const funnelWithDays = funnel.map((s) => ({
    ...s,
    avgDays: countPerStage[s.stageId]
      ? Math.round(avgDaysPerStage[s.stageId] / countPerStage[s.stageId])
      : null,
  }))

  // Email metrics
  const emailMetrics = await prisma.metricsSnapshot.aggregate({
    where: {
      pipelineId: pipeline.id,
      contact: ownerId ? { ownerId } : undefined,
    },
    _avg: { emailsOutCount: true, emailsInCount: true, daysSinceLastActivity: true },
    _count: { replyDetected: true },
    _sum: { emailsOutCount: true, emailsInCount: true },
  })

  const totalSnapshots = await prisma.metricsSnapshot.count({
    where: {
      pipelineId: pipeline.id,
      emailsOutCount: { gt: 0 },
      contact: ownerId ? { ownerId } : undefined,
    },
  })

  const repliedCount = await prisma.metricsSnapshot.count({
    where: {
      pipelineId: pipeline.id,
      replyDetected: true,
      contact: ownerId ? { ownerId } : undefined,
    },
  })

  const staleCount = await prisma.metricsSnapshot.count({
    where: {
      pipelineId: pipeline.id,
      staleFlag: true,
      contact: ownerId ? { ownerId } : undefined,
    },
  })

  // Owner performance
  const owners = await prisma.user.findMany({
    select: { id: true, name: true, image: true },
  })

  const ownerPerformance = await Promise.all(
    owners.map(async (owner) => {
      const snapshots = await prisma.metricsSnapshot.findMany({
        where: {
          pipelineId: pipeline.id,
          contact: { ownerId: owner.id },
        },
        select: {
          interactionsCount: true,
          demosCount: true,
          meetingsCount: true,
          replyDetected: true,
          emailsOutCount: true,
        },
      })

      const wonsCount = await prisma.contactPipelineState.count({
        where: {
          pipelineId: pipeline.id,
          status: 'WON',
          contact: { ownerId: owner.id },
        },
      })

      const totalWithEmail = snapshots.filter((s) => s.emailsOutCount > 0).length
      const repliedOwner = snapshots.filter((s) => s.replyDetected).length

      return {
        userId: owner.id,
        userName: owner.name ?? 'Inconnu',
        userImage: owner.image,
        contactsTotal: snapshots.length,
        contactsActive: snapshots.filter((s) => s.interactionsCount > 0).length,
        demosCount: snapshots.reduce((a, s) => a + s.demosCount, 0),
        meetingsCount: snapshots.reduce((a, s) => a + s.meetingsCount, 0),
        replyRate: totalWithEmail > 0 ? Math.round((repliedOwner / totalWithEmail) * 100) : 0,
        wonsCount,
      }
    })
  )

  return apiSuccess({
    funnel: funnelWithDays,
    emailMetrics: {
      totalEmailsOut: emailMetrics._sum.emailsOutCount ?? 0,
      totalEmailsIn: emailMetrics._sum.emailsInCount ?? 0,
      avgEmailsOutPerContact: emailMetrics._avg.emailsOutCount ?? 0,
      replyRate:
        totalSnapshots > 0 ? Math.round((repliedCount / totalSnapshots) * 100) : 0,
      staleCount,
      avgDaysSinceActivity: Math.round(emailMetrics._avg.daysSinceLastActivity ?? 0),
    },
    ownerPerformance: ownerPerformance.filter((o) => o.contactsTotal > 0),
  })
}
