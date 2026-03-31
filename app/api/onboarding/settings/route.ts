import { NextRequest } from 'next/server'
import { requireAuth, apiSuccess } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const settingsSchema = z.object({
  sheetId: z.string().optional(),
  tabName: z.string().optional(),
  columnMapping: z.record(z.string()).optional(),
  sheetsEnabled: z.boolean().optional(),
  gmailEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  sellsyClientId: z.string().optional(),
  sellsyClientSecret: z.string().optional(),
  sellsyEnabled: z.boolean().optional(),
  syncFrequency: z.number().optional(),
})

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  const body = await req.json()
  const parsed = settingsSchema.safeParse(body)
  if (!parsed.success) return apiSuccess({ error: 'Invalid' })

  const data: Record<string, any> = { ...parsed.data }

  // Encrypt sensitive fields
  if (data.sellsyClientSecret) {
    data.sellsyClientSecret = `enc:${Buffer.from(data.sellsyClientSecret).toString('base64')}`
  }

  const settings = await prisma.integrationSettings.upsert({
    where: { userId: session!.user.id },
    create: {
      userId: session!.user.id,
      ...data,
    },
    update: data,
  })

  return apiSuccess({ ok: true })
}

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  const settings = await prisma.integrationSettings.findUnique({
    where: { userId: session!.user.id },
    select: {
      sheetsEnabled: true, sheetId: true, tabName: true, columnMapping: true,
      gmailEnabled: true, sellsyEnabled: true, pushEnabled: true,
      lastSheetsSyncAt: true, lastGmailSyncAt: true, lastSellsySyncAt: true,
      syncFrequency: true,
    },
  })

  return apiSuccess(settings)
}
