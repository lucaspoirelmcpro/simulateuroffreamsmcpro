import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PipelineAdmin } from '@/components/admin/PipelineAdmin'

export default async function AdminPipelinePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const pipelines = await prisma.pipeline.findMany({
    include: {
      stages: { orderBy: { order: 'asc' } },
      _count: { select: { contactStates: true } },
    },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  })

  return <PipelineAdmin pipelines={pipelines as any} />
}
