'use client'

import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import { ContactCardData } from '@/types'
import { cn, getInitials, truncate } from '@/lib/utils'
import { DataCenter } from './DataCenter'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MoreHorizontal, Star, CheckSquare, MessageSquare,
  Trophy, XCircle, User, Building2, MapPin
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ContactCardProps {
  contact: ContactCardData
  pipelineId: string
  isDragging?: boolean
  onStageChange?: (contactId: string, stageId: string) => void
  onStatusChange?: (contactId: string, status: 'WON' | 'LOST') => void
  onCreateTask?: (contactId: string) => void
  onAddNote?: (contactId: string) => void
}

export function ContactCard({
  contact,
  pipelineId,
  isDragging = false,
  onStageChange,
  onStatusChange,
  onCreateTask,
  onAddNote,
}: ContactCardProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: contact.id,
    data: { type: 'card', contact },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const fullName = `${contact.firstname} ${contact.lastname}`
  const metrics = contact.metrics
  const sellsyLink = contact.sellsyLink

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'contact-card bg-white dark:bg-slate-900 border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing select-none',
        (isDragging || isSortableDragging) && 'opacity-50 shadow-2xl ring-2 ring-indigo-400',
        'group'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        // Don't navigate when dragging or clicking menu
        if (!(e.target as Element).closest('[data-radix-popper-content-wrapper]')) {
          router.push(`/contact/${contact.id}`)
        }
      }}
    >
      {/* Top row: identity + actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 min-w-0">
          {/* Owner avatar */}
          {contact.owner && (
            <Avatar className="h-6 w-6 shrink-0 mt-0.5">
              <AvatarImage src={contact.owner.image ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {getInitials(contact.owner.name ?? '?')}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="min-w-0">
            <div className="font-medium text-sm leading-snug truncate">{fullName}</div>
            {contact.title && (
              <div className="text-xs text-muted-foreground truncate">{contact.title}</div>
            )}
          </div>
        </div>

        {/* Quick actions menu */}
        <div className={cn('shrink-0 transition-opacity', isHovered ? 'opacity-100' : 'opacity-0')} onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onCreateTask?.(contact.id)}>
                <CheckSquare className="h-3.5 w-3.5 mr-2" />
                Créer une tâche
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddNote?.(contact.id)}>
                <MessageSquare className="h-3.5 w-3.5 mr-2" />
                Ajouter une note
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onStatusChange?.(contact.id, 'WON')}
                className="text-green-600"
              >
                <Trophy className="h-3.5 w-3.5 mr-2" />
                Marquer Gagné
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange?.(contact.id, 'LOST')}
                className="text-red-600"
              >
                <XCircle className="h-3.5 w-3.5 mr-2" />
                Marquer Perdu
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Org / Club */}
      {contact.org && (
        <div className="flex items-center gap-1 mb-2 text-xs text-muted-foreground">
          <Building2 className="h-3 w-3 shrink-0" />
          <span className="truncate font-medium">{contact.org.name}</span>
          {contact.org.country && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <MapPin className="h-3 w-3 shrink-0" />
              <span>{contact.org.country}</span>
            </>
          )}
        </div>
      )}

      {/* Tags */}
      {contact.tags && contact.tags.length > 0 && (
        <div className="flex items-center gap-1 mb-2 flex-wrap">
          {contact.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="h-4 px-1.5 text-[10px]">
              {tag}
            </Badge>
          ))}
          {contact.tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{contact.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Data Center Interactionnel */}
      <div className="border-t border-border/60 pt-2 mt-2">
        <DataCenter
          metrics={metrics}
          sellsyLink={sellsyLink}
          compact={!isHovered}
        />
      </div>
    </div>
  )
}

// Overlay card shown when dragging
export function ContactCardOverlay({ contact }: { contact: ContactCardData }) {
  const fullName = `${contact.firstname} ${contact.lastname}`
  return (
    <div className="contact-card bg-white dark:bg-slate-900 border-2 border-indigo-400 rounded-lg p-3 shadow-2xl rotate-2 opacity-95 w-[280px]">
      <div className="font-medium text-sm">{fullName}</div>
      {contact.org && (
        <div className="text-xs text-muted-foreground mt-0.5">{contact.org.name}</div>
      )}
    </div>
  )
}
