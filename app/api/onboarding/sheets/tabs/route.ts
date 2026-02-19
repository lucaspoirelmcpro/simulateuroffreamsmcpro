import { NextRequest } from 'next/server'
import { requireAuth, apiError, apiSuccess } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { listTabs } from '@/lib/sheets'
import { decrypt } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const sheetId = searchParams.get('sheetId')
  if (!sheetId) return apiError('sheetId required')

  const settings = await prisma.integrationSettings.findUnique({
    where: { userId: session!.user.id },
    select: { googleAccessToken: true },
  })

  if (!settings?.googleAccessToken) return apiError('No Google access token', 401)

  const accessToken = decrypt(settings.googleAccessToken)

  try {
    const tabs = await listTabs(accessToken, sheetId)
    return apiSuccess(tabs)
  } catch (e: any) {
    return apiError(e.message ?? 'Failed to list tabs', 500)
  }
}
