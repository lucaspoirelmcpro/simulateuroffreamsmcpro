import { NextRequest } from 'next/server'
import { requireAuth, apiError, apiSuccess } from '@/lib/api-helpers'
import { syncSellsyForUser } from '@/lib/sellsy'

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  try {
    const result = await syncSellsyForUser(session!.user.id)
    return apiSuccess(result)
  } catch (e: any) {
    return apiError(e.message ?? 'Sellsy sync failed', 500)
  }
}
