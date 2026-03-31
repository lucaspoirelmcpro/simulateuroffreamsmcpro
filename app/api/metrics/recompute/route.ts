import { NextRequest } from 'next/server'
import { requireRole, apiSuccess } from '@/lib/api-helpers'
import { recomputeAllMetrics, recomputeMetrics } from '@/lib/metrics'

export async function POST(req: NextRequest) {
  const { error } = await requireRole('ADMIN')
  if (error) return error

  const body = await req.json().catch(() => ({}))
  const { contactId, pipelineId } = body

  if (contactId) {
    await recomputeMetrics(contactId, pipelineId)
    return apiSuccess({ recomputed: 1 })
  }

  // Full recompute (background)
  recomputeAllMetrics().catch(console.error)
  return apiSuccess({ recomputed: 'all', status: 'background' })
}
