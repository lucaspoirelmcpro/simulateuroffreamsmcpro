import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { PipelineBoard } from '@/components/pipeline/PipelineBoard'
import { PipelineSwitcher } from '@/components/pipeline/PipelineSwitcher'

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: { pipeline?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Get default pipeline
  let pipeline
  if (searchParams.pipeline) {
    pipeline = await prisma.pipeline.findUnique({
      where: { id: searchParams.pipeline },
    })
  } else {
    pipeline = await prisma.pipeline.findFirst({
      where: { isDefault: true },
    })
    if (!pipeline) {
      pipeline = await prisma.pipeline.findFirst({
        orderBy: { createdAt: 'asc' },
      })
    }
  }

  // If no pipelines, redirect to onboarding
  if (!pipeline) {
    redirect('/onboarding')
  }

  const pipelines = await prisma.pipeline.findMany({
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    select: { id: true, name: true, stageType: true, isDefault: true },
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <PipelineSwitcher pipelines={pipelines} currentId={pipeline.id} />
        <div className="text-xs text-muted-foreground">
          <kbd className="bg-muted px-1.5 py-0.5 rounded font-mono">/</kbd> ou{' '}
          <kbd className="bg-muted px-1.5 py-0.5 rounded font-mono">⌘K</kbd> pour la palette de commandes
        </div>
      </div>

      <PipelineBoard pipelineId={pipeline.id} />
    </div>
  )
}
