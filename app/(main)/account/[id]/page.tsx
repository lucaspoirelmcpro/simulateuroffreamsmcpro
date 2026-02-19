import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, Globe, MapPin, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DataCenter } from '@/components/pipeline/DataCenter'
import { InteractionTimeline } from '@/components/contact/InteractionTimeline'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

export default async function AccountPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const org = await prisma.org.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { id: true, name: true, image: true } },
      contacts: {
        include: {
          pipelineStates: {
            include: { currentStage: true },
            take: 1,
          },
          _count: { select: { interactions: true } },
        },
      },
      interactions: { orderBy: { occurredAt: 'desc' }, take: 30 },
      metricsSnapshots: { take: 1 },
      sellsyLinks: { take: 1 },
    },
  })

  if (!org) notFound()

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="px-6 py-4 border-b border-border">
        <Link
          href="/pipeline"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Pipeline
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{org.name}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
              {org.domain && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  {org.domain}
                </span>
              )}
              {org.country && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {org.country}
                </span>
              )}
              {org.segment && (
                <Badge variant="secondary" className="h-5 px-2 text-xs">
                  {org.segment}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: contacts */}
        <div className="w-72 border-r border-border overflow-auto p-4 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Contacts ({org.contacts.length})
            </h3>
            <div className="space-y-2">
              {org.contacts.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/contact/${contact.id}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700">
                      {getInitials(`${contact.firstname} ${contact.lastname}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {contact.firstname} {contact.lastname}
                    </div>
                    {contact.pipelineStates[0]?.currentStage && (
                      <div className="flex items-center gap-1">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: contact.pipelineStates[0].currentStage.color }}
                        />
                        <span className="text-[10px] text-muted-foreground">
                          {contact.pipelineStates[0].currentStage.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {contact._count.interactions} int.
                  </span>
                </Link>
              ))}
              {org.contacts.length === 0 && (
                <p className="text-xs text-muted-foreground">Aucun contact</p>
              )}
            </div>
          </div>

          {/* Data Center */}
          {org.metricsSnapshots[0] && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Data Center
              </h3>
              <DataCenter
                metrics={org.metricsSnapshots[0]}
                sellsyLink={org.sellsyLinks[0]}
                compact={false}
              />
            </div>
          )}
        </div>

        {/* Right: timeline */}
        <ScrollArea className="flex-1 p-6">
          <h3 className="text-sm font-semibold mb-4">Timeline des interactions</h3>
          <InteractionTimeline interactions={org.interactions as any[]} />
        </ScrollArea>
      </div>
    </div>
  )
}
