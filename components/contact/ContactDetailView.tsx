'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cn, formatDate, formatRelativeDate, getInitials, calcHealthScore } from '@/lib/utils'
import { DataCenter } from '@/components/pipeline/DataCenter'
import { InteractionTimeline } from './InteractionTimeline'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft, Mail, Phone, Building2, MapPin, User, Tag,
  Calendar, CheckSquare, MessageSquare, Layers, TrendingUp,
  Clock, ChevronRight, Edit, ExternalLink, Activity,
  Trash2, RefreshCw
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

export function ContactDetailView({ contact }: { contact: any }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'timeline' | 'emails' | 'tasks' | 'notes'>('timeline')

  const fullName = `${contact.firstname} ${contact.lastname}`
  const mainMetrics = contact.metricsSnapshots?.[0] ?? null
  const sellsyLink = contact.sellsyLinks?.[0] ?? null
  const mainPipelineState = contact.pipelineStates?.[0] ?? null

  const healthScore = mainMetrics
    ? calcHealthScore({
        staleFlag: mainMetrics.staleFlag,
        nextStepMissing: mainMetrics.nextStepMissing,
        replyDetected: mainMetrics.replyDetected,
        daysSinceLastActivity: mainMetrics.daysSinceLastActivity,
        demosCount: mainMetrics.demosCount,
        nextMeetingAt: mainMetrics.nextMeetingAt,
      })
    : null

  return (
    <div className="flex h-full">
      {/* Left panel: details */}
      <div className="w-72 shrink-0 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 mb-3 -ml-1 h-7 text-muted-foreground hover:text-foreground"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour
          </Button>

          {/* Identity */}
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-base leading-tight truncate">{fullName}</h1>
              {contact.title && (
                <p className="text-xs text-muted-foreground mt-0.5">{contact.title}</p>
              )}
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Pipeline stage */}
            {mainPipelineState && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Pipeline
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: mainPipelineState.currentStage?.color ?? '#6366f1' }}
                  />
                  <span className="text-sm font-medium">
                    {mainPipelineState.currentStage?.name ?? 'Stage inconnu'}
                  </span>
                  {mainPipelineState.status !== 'OPEN' && (
                    <Badge
                      variant={mainPipelineState.status === 'WON' ? 'success' : 'destructive'}
                      className="h-4 px-1.5 text-[10px]"
                    >
                      {mainPipelineState.status === 'WON' ? 'Gagné' : 'Perdu'}
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Pipeline: {mainPipelineState.pipeline?.name}
                </p>
              </div>
            )}

            <Separator />

            {/* Contact info */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Coordonnées
              </div>
              <div className="space-y-1.5">
                {contact.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-indigo-600 hover:underline truncate text-xs"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <a href={`tel:${contact.phone}`} className="text-xs text-foreground hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.org && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <Link
                      href={`/account/${contact.org.id}`}
                      className="text-xs text-indigo-600 hover:underline truncate"
                    >
                      {contact.org.name}
                    </Link>
                  </div>
                )}
                {contact.country && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs">{contact.country}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Owner */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Responsable
              </div>
              {contact.owner ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={contact.owner.image ?? undefined} />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(contact.owner.name ?? '?')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{contact.owner.name}</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Non assigné</span>
              )}
            </div>

            {/* Tags */}
            {contact.tags?.length > 0 && (
              <>
                <Separator />
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="h-5 px-2 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Health score */}
            {healthScore !== null && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Score de santé
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        healthScore >= 70 ? 'bg-green-500' : healthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      )}
                      style={{ width: `${healthScore}%` }}
                    />
                  </div>
                  <span className={cn(
                    'text-xs font-semibold',
                    healthScore >= 70 ? 'text-green-600' : healthScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                  )}>
                    {healthScore}
                  </span>
                </div>
              </div>
            )}

            {/* Data Center */}
            <Separator />
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Data Center
              </div>
              <DataCenter
                metrics={mainMetrics}
                sellsyLink={sellsyLink}
                compact={false}
              />
            </div>

            {/* Sellsy link */}
            {sellsyLink?.sellsyOpportunityId && (
              <>
                <Separator />
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Sellsy
                  </div>
                  <div className="space-y-1 text-xs">
                    {sellsyLink.sellsyStage && (
                      <div className="text-muted-foreground">
                        Stage: <span className="text-foreground">{sellsyLink.sellsyStage}</span>
                      </div>
                    )}
                    {sellsyLink.amount && (
                      <div className="text-muted-foreground">
                        Montant:{' '}
                        <span className="text-foreground font-medium">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(sellsyLink.amount)}
                        </span>
                      </div>
                    )}
                    {sellsyLink.closeDate && (
                      <div className="text-muted-foreground">
                        Clôture: <span className="text-foreground">{formatDate(sellsyLink.closeDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right panel: timeline, emails, tasks */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center gap-0 border-b border-border px-4 pt-3">
          {[
            { id: 'timeline', label: 'Timeline', count: contact._count?.interactions },
            { id: 'emails', label: 'Emails', count: contact.emailThreads?.length },
            { id: 'tasks', label: 'Tâches', count: contact._count?.tasks },
            { id: 'notes', label: 'Notes', count: contact._count?.notes },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="text-xs bg-muted rounded-full px-1.5 py-0.5 font-normal leading-none">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <ScrollArea className="flex-1 p-4">
          {activeTab === 'timeline' && (
            <InteractionTimeline interactions={contact.interactions ?? []} />
          )}

          {activeTab === 'emails' && (
            <EmailThreadsList threads={contact.emailThreads ?? []} />
          )}

          {activeTab === 'tasks' && (
            <TasksList tasks={contact.tasks ?? []} />
          )}

          {activeTab === 'notes' && (
            <NotesList notes={contact.notes ?? []} />
          )}
        </ScrollArea>
      </div>
    </div>
  )
}

function EmailThreadsList({ threads }: { threads: any[] }) {
  if (threads.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        Aucun email synchronisé. Activez la sync Gmail dans les intégrations.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {threads.map((thread: any) => (
        <div
          key={thread.id}
          className="p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {thread.subject ?? '(sans sujet)'}
                </span>
                {thread.hasReply && (
                  <Badge variant="success" className="h-4 px-1.5 text-[10px] shrink-0">
                    Réponse
                  </Badge>
                )}
              </div>
              {thread.snippet && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {thread.snippet}
                </p>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {formatRelativeDate(thread.lastMessageAt)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] text-muted-foreground">
              {thread.messagesCount} message{thread.messagesCount > 1 ? 's' : ''}
            </span>
            {thread.lastSentAt && (
              <span className="text-[10px] text-muted-foreground">
                Envoyé {formatRelativeDate(thread.lastSentAt)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function TasksList({ tasks }: { tasks: any[] }) {
  if (tasks.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        Aucune tâche pour ce contact.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map((task: any) => (
        <div
          key={task.id}
          className={cn(
            'p-3 rounded-lg border transition-colors',
            task.status === 'DONE' ? 'border-border bg-muted/30 opacity-60' : 'border-border hover:bg-accent/50'
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckSquare
                className={cn(
                  'h-4 w-4 shrink-0',
                  task.status === 'DONE' ? 'text-green-500' : 'text-muted-foreground'
                )}
              />
              <span className={cn('text-sm', task.status === 'DONE' && 'line-through text-muted-foreground')}>
                {task.notes ?? task.type}
              </span>
            </div>
            <Badge variant="outline" className="h-5 px-2 text-xs shrink-0">
              {task.type}
            </Badge>
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground ml-6">
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function NotesList({ notes }: { notes: any[] }) {
  if (notes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        Aucune note pour ce contact.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notes.map((note: any) => (
        <div key={note.id} className="p-3 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-1.5">
            <Avatar className="h-5 w-5">
              <AvatarImage src={note.author?.image ?? undefined} />
              <AvatarFallback className="text-[9px]">
                {getInitials(note.author?.name ?? '?')}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{note.author?.name}</span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {formatRelativeDate(note.createdAt)}
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {note.content}
          </p>
        </div>
      ))}
    </div>
  )
}
