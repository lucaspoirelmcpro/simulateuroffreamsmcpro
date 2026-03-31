import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { ContactDetailView } from '@/components/contact/ContactDetailView'

export default async function ContactPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const contact = await prisma.contact.findUnique({
    where: { id: params.id },
    include: {
      org: true,
      owner: { select: { id: true, name: true, image: true, email: true } },
      pipelineStates: {
        include: {
          currentStage: true,
          pipeline: { select: { id: true, name: true } },
        },
      },
      stageHistory: {
        include: {
          fromStage: { select: { id: true, name: true, color: true } },
          toStage: { select: { id: true, name: true, color: true } },
          changedBy: { select: { id: true, name: true, image: true } },
        },
        orderBy: { changedAt: 'desc' },
        take: 20,
      },
      interactions: {
        orderBy: { occurredAt: 'desc' },
        take: 50,
      },
      emailThreads: {
        orderBy: { lastMessageAt: 'desc' },
        take: 20,
      },
      tasks: {
        where: { status: { not: 'CANCELLED' } },
        include: { owner: { select: { id: true, name: true, image: true } } },
        orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
      },
      notes: {
        include: { author: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      metricsSnapshots: true,
      sellsyLinks: true,
      _count: {
        select: { interactions: true, tasks: true, notes: true },
      },
    },
  })

  if (!contact) notFound()

  return <ContactDetailView contact={contact as any} />
}
