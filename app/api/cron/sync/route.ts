import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncFromSheets } from '@/lib/sheets'
import { syncGmailForUser } from '@/lib/gmail'
import { syncSellsyForUser } from '@/lib/sellsy'
import { recomputeAllMetrics } from '@/lib/metrics'
import { NextResponse } from 'next/server'

// Vercel Cron endpoint - called periodically
// Add to vercel.json: { "crons": [{ "path": "/api/cron/sync", "schedule": "*/30 * * * *" }] }
export async function GET(req: NextRequest) {
  // Validate cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, any> = {}

  // Get all users with integrations enabled
  const users = await prisma.integrationSettings.findMany({
    select: {
      userId: true,
      sheetsEnabled: true,
      gmailEnabled: true,
      sellsyEnabled: true,
    },
  })

  for (const user of users) {
    const userResults: Record<string, any> = {}

    if (user.sheetsEnabled) {
      try {
        userResults.sheets = await syncFromSheets(user.userId)
      } catch (e: any) {
        userResults.sheets = { error: e.message }
      }
    }

    if (user.gmailEnabled) {
      try {
        userResults.gmail = await syncGmailForUser(user.userId)
      } catch (e: any) {
        userResults.gmail = { error: e.message }
      }
    }

    if (user.sellsyEnabled) {
      try {
        userResults.sellsy = await syncSellsyForUser(user.userId)
      } catch (e: any) {
        userResults.sellsy = { error: e.message }
      }
    }

    results[user.userId] = userResults
  }

  // Recompute all metrics snapshots
  try {
    await recomputeAllMetrics()
    results.metrics = 'recomputed'
  } catch (e: any) {
    results.metrics = { error: e.message }
  }

  return NextResponse.json({ ok: true, results, timestamp: new Date() })
}
