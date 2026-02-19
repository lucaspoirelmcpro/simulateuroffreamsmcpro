import { NextRequest } from 'next/server'
import { requireAuth, apiError, apiSuccess } from '@/lib/api-helpers'
import { syncGmailForUser } from '@/lib/gmail'

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  try {
    const result = await syncGmailForUser(session!.user.id)
    return apiSuccess(result)
  } catch (e: any) {
    return apiError(e.message ?? 'Gmail sync failed', 500)
  }
}
