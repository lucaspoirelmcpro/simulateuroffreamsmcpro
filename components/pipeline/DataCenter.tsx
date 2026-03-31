'use client'

import React, { useState } from 'react'
import { MetricsSnapshot, SellsyLink } from '@prisma/client'
import { cn, formatRelativeDate, formatDate } from '@/lib/utils'
import {
  Mail, Phone, Calendar, BarChart2, AlertTriangle,
  CheckCircle, Clock, TrendingUp, ChevronDown, ChevronUp,
  Activity, Video, MessageCircle, Euro
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

interface DataCenterProps {
  metrics: MetricsSnapshot | null | undefined
  sellsyLink?: SellsyLink | null
  compact?: boolean
  className?: string
}

/**
 * Data Center Interactionnel
 * Compact mode: badges + mini chiffres (sur la card)
 * Expanded mode: mini timeline + next step + tâche due
 */
export function DataCenter({ metrics, sellsyLink, compact = true, className }: DataCenterProps) {
  const [expanded, setExpanded] = useState(false)

  if (!metrics && !sellsyLink) {
    return (
      <div className={cn('text-xs text-muted-foreground italic', className)}>
        Aucune donnée
      </div>
    )
  }

  const m = metrics

  return (
    <TooltipProvider>
      <div className={cn('space-y-1.5', className)}>
        {/* Top row: counters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Interactions total */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Activity className="h-3 w-3" />
                <span className="font-medium text-foreground">{m?.interactionsCount ?? 0}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>{m?.interactionsCount ?? 0} interactions (90j)</TooltipContent>
          </Tooltip>

          <span className="text-muted-foreground/40">·</span>

          {/* Emails out/in */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="font-medium text-foreground">{m?.emailsOutCount ?? 0}</span>
                <span className="text-muted-foreground/60">/</span>
                <span className="font-medium text-foreground">{m?.emailsInCount ?? 0}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Emails envoyés / reçus</TooltipContent>
          </Tooltip>

          <span className="text-muted-foreground/40">·</span>

          {/* Meetings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span className="font-medium text-foreground">{m?.meetingsCount ?? 0}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>{m?.meetingsCount ?? 0} RDV (90j)</TooltipContent>
          </Tooltip>

          {/* Demos */}
          {(m?.demosCount ?? 0) > 0 && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-0.5 text-xs text-blue-600">
                    <Video className="h-3 w-3" />
                    <span className="font-medium">{m?.demosCount}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{m?.demosCount} démos (180j)</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>

        {/* Status badges row */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* Reply indicator */}
          {m?.replyDetected && (
            <Badge variant="success" className="h-4 px-1.5 text-[10px] font-medium gap-0.5">
              <CheckCircle className="h-2.5 w-2.5" />
              Replied
            </Badge>
          )}

          {/* Stale indicator */}
          {m?.staleFlag && (
            <Badge variant="warning" className="h-4 px-1.5 text-[10px] font-medium gap-0.5">
              <AlertTriangle className="h-2.5 w-2.5" />
              Stale {m.daysSinceLastActivity}j
            </Badge>
          )}

          {/* Next step missing */}
          {m?.nextStepMissing && (
            <Badge variant="destructive" className="h-4 px-1.5 text-[10px] font-medium gap-0.5 bg-red-100 text-red-700 border-transparent">
              <Clock className="h-2.5 w-2.5" />
              Next step ?
            </Badge>
          )}

          {/* Sellsy stage */}
          {sellsyLink?.sellsyStage && (
            <Badge variant="info" className="h-4 px-1.5 text-[10px] font-medium gap-0.5">
              <TrendingUp className="h-2.5 w-2.5" />
              {sellsyLink.sellsyStage}
            </Badge>
          )}

          {/* Sellsy amount */}
          {sellsyLink?.amount && sellsyLink.amount > 0 && (
            <Badge variant="outline" className="h-4 px-1.5 text-[10px] font-medium gap-0.5">
              <Euro className="h-2.5 w-2.5" />
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(sellsyLink.amount)}
            </Badge>
          )}
        </div>

        {/* Last activity date (always shown) */}
        {m?.lastInteractionAt && (
          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            Dernier contact: {formatRelativeDate(m.lastInteractionAt)}
          </div>
        )}

        {/* Next meeting */}
        {m?.nextMeetingAt && (
          <div className="text-[10px] text-green-600 flex items-center gap-1 font-medium">
            <Calendar className="h-2.5 w-2.5" />
            Prochain RDV: {formatDate(m.nextMeetingAt)}
          </div>
        )}

        {/* Expand toggle */}
        {!compact && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? 'Moins' : 'Détails'}
          </button>
        )}

        {/* Expanded section */}
        {expanded && (
          <div className="pt-1.5 border-t border-border space-y-1.5 animate-fade-in">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Dates clés
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {m?.lastEmailAt && (
                <div className="text-[10px] text-muted-foreground">
                  Email: <span className="text-foreground">{formatRelativeDate(m.lastEmailAt)}</span>
                </div>
              )}
              {m?.lastMeetingAt && (
                <div className="text-[10px] text-muted-foreground">
                  RDV: <span className="text-foreground">{formatRelativeDate(m.lastMeetingAt)}</span>
                </div>
              )}
              {m?.lastDemoAt && (
                <div className="text-[10px] text-muted-foreground">
                  Démo: <span className="text-foreground">{formatRelativeDate(m.lastDemoAt)}</span>
                </div>
              )}
              {m?.lastReplyAt && (
                <div className="text-[10px] text-muted-foreground">
                  Réponse: <span className="text-foreground">{formatRelativeDate(m.lastReplyAt)}</span>
                </div>
              )}
            </div>

            {sellsyLink && (
              <div className="space-y-0.5">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Sellsy
                </div>
                {sellsyLink.sellsyStage && (
                  <div className="text-[10px] text-muted-foreground">
                    Stage: <span className="text-foreground">{sellsyLink.sellsyStage}</span>
                  </div>
                )}
                {sellsyLink.amount && (
                  <div className="text-[10px] text-muted-foreground">
                    Montant: <span className="text-foreground font-medium">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(sellsyLink.amount)}
                    </span>
                  </div>
                )}
                {sellsyLink.closeDate && (
                  <div className="text-[10px] text-muted-foreground">
                    Échéance: <span className="text-foreground">{formatDate(sellsyLink.closeDate)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
