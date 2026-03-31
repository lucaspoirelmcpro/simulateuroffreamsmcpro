'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { PipelineStage } from '@prisma/client'
import { ContactCardData } from '@/types'
import { ContactCard } from './ContactCard'
import { cn } from '@/lib/utils'
import { Plus, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PipelineColumnProps {
  stage: PipelineStage
  contacts: ContactCardData[]
  pipelineId: string
  isOver?: boolean
  onAddContact?: (stageId: string) => void
  onStageChange?: (contactId: string, stageId: string) => void
  onStatusChange?: (contactId: string, status: 'WON' | 'LOST') => void
  onCreateTask?: (contactId: string) => void
  onAddNote?: (contactId: string) => void
}

export function PipelineColumn({
  stage,
  contacts,
  pipelineId,
  isOver,
  onAddContact,
  onStageChange,
  onStatusChange,
  onCreateTask,
  onAddNote,
}: PipelineColumnProps) {
  const { setNodeRef, isOver: droppableIsOver } = useDroppable({
    id: stage.id,
    data: { type: 'column', stageId: stage.id },
  })

  const contactIds = contacts.map((c) => c.id)

  return (
    <div className="pipeline-column flex flex-col" ref={setNodeRef}>
      {/* Column header - sticky */}
      <div className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm rounded-t-lg border border-border border-b-0 px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Stage color dot */}
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: stage.color }}
            />
            <span className="text-sm font-semibold text-foreground leading-none">
              {stage.name}
            </span>
            {/* Count badge */}
            <span className="text-xs text-muted-foreground bg-background/60 rounded-full px-2 py-0.5 font-medium leading-none">
              {contacts.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-60 hover:opacity-100"
            onClick={() => onAddContact?.(stage.id)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Cards container */}
      <ScrollArea
        className={cn(
          'flex-1 rounded-b-lg border border-border border-t-0 p-2 min-h-[200px] max-h-[calc(100vh-180px)] transition-colors',
          (isOver || droppableIsOver) && 'bg-indigo-50/60 dark:bg-indigo-900/20 border-indigo-300'
        )}
      >
        <SortableContext items={contactIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                pipelineId={pipelineId}
                onStageChange={onStageChange}
                onStatusChange={onStatusChange}
                onCreateTask={onCreateTask}
                onAddNote={onAddNote}
              />
            ))}
          </div>
        </SortableContext>

        {/* Empty state */}
        {contacts.length === 0 && (
          <div
            className={cn(
              'flex flex-col items-center justify-center h-24 text-xs text-muted-foreground rounded-md border-2 border-dashed border-border/60 transition-colors',
              (isOver || droppableIsOver) && 'border-indigo-400 text-indigo-500 bg-indigo-50/40'
            )}
          >
            {(isOver || droppableIsOver)
              ? 'Déposer ici'
              : 'Aucun contact'}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
