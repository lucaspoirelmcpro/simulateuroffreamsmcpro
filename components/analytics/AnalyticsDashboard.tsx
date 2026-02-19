'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, getInitials } from '@/lib/utils'
import {
  BarChart2, TrendingUp, Mail, Clock, Users, CheckCircle,
  AlertTriangle, Video, Calendar, ChevronRight, Loader2
} from 'lucide-react'

interface Pipeline { id: string; name: string; isDefault: boolean }

export function AnalyticsDashboard({ pipelines }: { pipelines: Pipeline[] }) {
  const [pipelineId, setPipelineId] = useState(
    pipelines.find((p) => p.isDefault)?.id ?? pipelines[0]?.id ?? ''
  )
  const [days, setDays] = useState('90')

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', pipelineId, days],
    queryFn: () =>
      fetch(`/api/analytics?pipelineId=${pipelineId}&days=${days}`).then((r) => r.json()),
    enabled: !!pipelineId,
  })

  const funnel = data?.funnel ?? []
  const email = data?.emailMetrics ?? {}
  const owners = data?.ownerPerformance ?? []
  const maxCount = Math.max(...funnel.map((s: any) => s.count), 1)

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background sticky top-0 z-10">
        <h1 className="text-lg font-semibold">Analytics</h1>
        <div className="flex items-center gap-3">
          <Select value={pipelineId} onValueChange={setPipelineId}>
            <SelectTrigger className="w-48 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-32 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 jours</SelectItem>
              <SelectItem value="90">90 jours</SelectItem>
              <SelectItem value="180">180 jours</SelectItem>
              <SelectItem value="365">1 an</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="p-6 space-y-8">
          {/* Email metrics cards */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Vue d'ensemble
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                label="Taux de réponse"
                value={`${email.replyRate ?? 0}%`}
                icon={<CheckCircle className="h-5 w-5 text-green-600" />}
                sublabel={`${email.totalEmailsOut ?? 0} emails envoyés`}
                color="green"
              />
              <MetricCard
                label="Contacts stale"
                value={email.staleCount ?? 0}
                icon={<AlertTriangle className="h-5 w-5 text-yellow-600" />}
                sublabel={`> ${data?.staleAfterDays ?? 14} jours inactifs`}
                color="yellow"
              />
              <MetricCard
                label="Moy. jours inactif"
                value={`${email.avgDaysSinceActivity ?? 0}j`}
                icon={<Clock className="h-5 w-5 text-blue-600" />}
                sublabel="Sur tous les contacts"
                color="blue"
              />
              <MetricCard
                label="Emails échangés"
                value={`${email.totalEmailsOut ?? 0} / ${email.totalEmailsIn ?? 0}`}
                icon={<Mail className="h-5 w-5 text-indigo-600" />}
                sublabel="Out / In"
                color="indigo"
              />
            </div>
          </div>

          {/* Funnel */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Funnel de conversion
            </h2>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-border p-6 space-y-3">
              {funnel.map((stage: any, idx: number) => (
                <div key={stage.stageId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stage.stageColor }}
                      />
                      <span className="font-medium">{stage.stageName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground text-xs">
                      {stage.avgDays !== null && (
                        <span>Moy. {stage.avgDays}j</span>
                      )}
                      <span className="font-semibold text-foreground text-sm">
                        {stage.count}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(stage.count / maxCount) * 100}%`,
                        backgroundColor: stage.stageColor,
                      }}
                    />
                  </div>
                  {/* Conversion rate to next stage */}
                  {idx < funnel.length - 1 && funnel[idx + 1]?.count > 0 && stage.count > 0 && (
                    <div className="text-[10px] text-muted-foreground pl-5 flex items-center gap-1">
                      <ChevronRight className="h-3 w-3" />
                      {Math.round((funnel[idx + 1].count / stage.count) * 100)}% → {funnel[idx + 1].stageName}
                    </div>
                  )}
                </div>
              ))}
              {funnel.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Aucune donnée pour la période sélectionnée
                </div>
              )}
            </div>
          </div>

          {/* Owner performance */}
          {owners.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                Performance par commercial
              </h2>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/30">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Commercial</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Contacts</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actifs</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">RDV</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Démos</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Réponses</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Gagnés</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {owners.map((owner: any) => (
                      <tr key={owner.userId} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={owner.userImage ?? undefined} />
                              <AvatarFallback className="text-[10px]">
                                {getInitials(owner.userName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{owner.userName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">{owner.contactsTotal}</td>
                        <td className="px-4 py-3 text-right">{owner.contactsActive}</td>
                        <td className="px-4 py-3 text-right">{owner.meetingsCount}</td>
                        <td className="px-4 py-3 text-right">{owner.demosCount}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn(
                            'font-medium',
                            owner.replyRate >= 50 ? 'text-green-600' : owner.replyRate >= 25 ? 'text-yellow-600' : 'text-muted-foreground'
                          )}>
                            {owner.replyRate}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Badge variant="success" className="h-5 px-2 text-xs">
                            {owner.wonsCount}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MetricCard({
  label, value, icon, sublabel, color
}: { label: string; value: string | number; icon: React.ReactNode; sublabel: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 dark:bg-green-900/20',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20',
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20',
  }

  return (
    <div className={cn('rounded-xl border border-border p-4', colors[color])}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sublabel}</div>
    </div>
  )
}
