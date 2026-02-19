import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, apiError, apiSuccess } from '@/lib/api-helpers'

// Returns the full board: stages + contacts grouped per stage
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const ownerId = searchParams.get('ownerId')
  const search = searchParams.get('search')
  const staleOnly = searchParams.get('staleOnly') === 'true'
  const nextStepMissing = searchParams.get('nextStepMissing') === 'true'

  const pipeline = await prisma.pipeline.findUnique({
    where: { id: params.id },
    include: {
      stages: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!pipeline) return apiError('Pipeline not found', 404)

  const contactWhere: Record<string, any> = {}
  if (search) {
    contactWhere.contact = {
      OR: [
        { firstname: { contains: search, mode: 'insensitive' } },
        { lastname: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { org: { name: { contains: search, mode: 'insensitive' } } },
      ],
    }
  }

  const metricsWhere: Record<string, any> = {}
  if (staleOnly) metricsWhere.staleFlag = true
  if (nextStepMissing) metricsWhere.nextStepMissing = true

  const stageData = await Promise.all(
    pipeline.stages.map(async (stage) => {
      const contactStates = await prisma.contactPipelineState.findMany({
        where: {
          pipelineId: params.id,
          currentStageId: stage.id,
          status: 'OPEN',
          ...(ownerId ? { contact: { ownerId } } : {}),
          ...(search ? contactWhere : {}),
        },
        include: {
          contact: {
            include: {
              org: true,
              owner: { select: { id: true, name: true, image: true } },
              metricsSnapshots: {
                where: { pipelineId: params.id },
                take: 1,
              },
              sellsyLinks: { take: 1 },
              _count: { select: { tasks: { where: { status: 'OPEN' } } } },
            },
          },
        },
        orderBy: { lastActivityAt: 'desc' },
      })

      // Filter by metrics if needed
      let filtered = contactStates
      if (staleOnly || nextStepMissing) {
        filtered = contactStates.filter((cs) => {
          const m = cs.contact.metricsSnapshots[0]
          if (!m) return false
          if (staleOnly && !m.staleFlag) return false
          if (nextStepMissing && !m.nextStepMissing) return false
          return true
        })
      }

      return {
        ...stage,
        contacts: filtered.map((cs) => ({
          ...cs.contact,
          pipelineStatus: cs,
          metrics: cs.contact.metricsSnapshots[0] ?? null,
          sellsyLink: cs.contact.sellsyLinks[0] ?? null,
        })),
        _count: { contacts: filtered.length },
      }
    })
  )

  return apiSuccess({
    pipeline,
    stages: stageData,
  })
}
