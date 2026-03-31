import { NextRequest } from 'next/server'
import { requireAuth, apiError, apiSuccess } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { readTab } from '@/lib/sheets'
import { decrypt } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const sheetId = searchParams.get('sheetId')
  const tab = searchParams.get('tab')
  if (!sheetId || !tab) return apiError('sheetId and tab required')

  const settings = await prisma.integrationSettings.findUnique({
    where: { userId: session!.user.id },
    select: { googleAccessToken: true },
  })

  if (!settings?.googleAccessToken) return apiError('No Google access token', 401)

  const accessToken = decrypt(settings.googleAccessToken)

  try {
    const { headers } = await readTab(accessToken, sheetId, tab)
    return apiSuccess(headers)
  } catch (e: any) {
    return apiError(e.message ?? 'Failed to read headers', 500)
  }
}
