'use client'

import React from 'react'
import { Interaction } from '@prisma/client'
import { cn, formatDateTime, formatRelativeDate } from '@/lib/utils'
import {
  Mail, Phone, Calendar, Video, MessageCircle, Linkedin,
  FileText, TrendingUp, GitCommit, Clock
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const interactionConfig: Record<
  string,
  { icon: React.ReactNode; label: string; color: string }
> = {
  EMAIL_OUT: { icon: <Mail className="h-3.5 w-3.5" />, label: 'Email envoyé', color: 'text-blue-600' },
  EMAIL_IN: { icon: <Mail className="h-3.5 w-3.5" />, label: 'Email reçu', color: 'text-green-600' },
  CALL: { icon: <Phone className="h-3.5 w-3.5" />, label: 'Appel', color: 'text-purple-600' },
  MEETING: { icon: <Calendar className="h-3.5 w-3.5" />, label: 'RDV', color: 'text-orange-600' },
  DEMO: { icon: <Video className="h-3.5 w-3.5" />, label: 'Démo', color: 'text-indigo-600' },
  WHATSAPP: { icon: <MessageCircle className="h-3.5 w-3.5" />, label: 'WhatsApp', color: 'text-green-500' },
  LINKEDIN: { icon: <Linkedin className="h-3.5 w-3.5" />, label: 'LinkedIn', color: 'text-blue-700' },
  NOTE: { icon: <FileText className="h-3.5 w-3.5" />, label: 'Note', color: 'text-gray-600' },
  SELLSY_EVENT: { icon: <TrendingUp className="h-3.5 w-3.5" />, label: 'Sellsy', color: 'text-teal-600' },
  STAGE_CHANGE: { icon: <GitCommit className="h-3.5 w-3.5" />, label: 'Stage changé', color: 'text-violet-600' },
}

interface InteractionTimelineProps {
  interactions: Interaction[]
  maxItems?: number
}

export function InteractionTimeline({ interactions, maxItems }: InteractionTimelineProps) {
  const items = maxItems ? interactions.slice(0, maxItems) : interactions

  if (items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-6">
        Aucune interaction enregistrée
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-1">
        {items.map((interaction, idx) => {
          const config = interactionConfig[interaction.type] ?? {
            icon: <Clock className="h-3.5 w-3.5" />,
            label: interaction.type,
            color: 'text-gray-500',
          }

          return (
            <div key={interaction.id} className="flex items-start gap-3 pl-2">
              {/* Icon on timeline */}
              <div
                className={cn(
                  'w-6 h-6 rounded-full border-2 border-background bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 z-10 relative',
                  config.color
                )}
              >
                {config.icon}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-medium', config.color)}>
                      {config.label}
                    </span>
                    {interaction.source !== 'MANUAL' && (
                      <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                        {interaction.source === 'GMAIL' ? 'Gmail' : interaction.source === 'SELLSY' ? 'Sellsy' : interaction.source}
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {formatRelativeDate(interaction.occurredAt)}
                  </span>
                </div>

                {interaction.summary && (
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {interaction.summary}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
