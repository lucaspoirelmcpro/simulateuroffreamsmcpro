import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const pipelines = await prisma.pipeline.findMany({
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    select: { id: true, name: true, isDefault: true },
  })

  return <AnalyticsDashboard pipelines={pipelines} />
}
