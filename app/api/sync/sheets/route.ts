import { NextRequest } from 'next/server'
import { requireAuth, apiError, apiSuccess } from '@/lib/api-helpers'
import { syncFromSheets } from '@/lib/sheets'

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  try {
    const result = await syncFromSheets(session!.user.id)
    return apiSuccess(result)
  } catch (e: any) {
    return apiError(e.message ?? 'Sheets sync failed', 500)
  }
}
