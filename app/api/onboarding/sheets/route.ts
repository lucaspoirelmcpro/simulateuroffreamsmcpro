import { NextRequest } from 'next/server'
import { requireAuth, apiError, apiSuccess } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { listSpreadsheets } from '@/lib/sheets'
import { decrypt } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  const settings = await prisma.integrationSettings.findUnique({
    where: { userId: session!.user.id },
    select: { googleAccessToken: true },
  })

  if (!settings?.googleAccessToken) {
    return apiError('No Google access token. Please sign in with Google.', 401)
  }

  const accessToken = decrypt(settings.googleAccessToken)

  try {
    const files = await listSpreadsheets(accessToken)
    return apiSuccess(files)
  } catch (e: any) {
    return apiError(e.message ?? 'Failed to list spreadsheets', 500)
  }
}
