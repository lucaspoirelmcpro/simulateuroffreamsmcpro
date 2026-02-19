'use client'

import React, { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ContactCardData, StageWithContacts } from '@/types'
import { PipelineColumn } from './PipelineColumn'
import { ContactCardOverlay } from './ContactCard'
import { PipelineFiltersBar } from './PipelineFiltersBar'
import { cn } from '@/lib/utils'

interface PipelineBoardProps {
  pipelineId: string
}

async function fetchBoard(pipelineId: string, params: Record<string, string>) {
  const url = new URL(`/api/pipeline/${pipelineId}/board`, window.location.origin)
  Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v))
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch board')
  const data = await res.json()
  return data
}

async function changeStage(contactId: string, pipelineId: string, stageId: string) {
  const res = await fetch(`/api/contacts/${contactId}/stage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pipelineId, stageId }),
  })
  if (!res.ok) throw new Error('Stage change failed')
  return res.json()
}

export function PipelineBoard({ pipelineId }: PipelineBoardProps) {
  const queryClient = useQueryClient()
  const [activeContact, setActiveContact] = useState<ContactCardData | null>(null)
  const [filters, setFilters] = useState<Record<string, string>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['board', pipelineId, filters],
    queryFn: () => fetchBoard(pipelineId, filters),
    refetchInterval: 60_000, // refresh every minute
  })

  const stageMutation = useMutation({
    mutationFn: ({ contactId, stageId }: { contactId: string; stageId: string }) =>
      changeStage(contactId, pipelineId, stageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', pipelineId] })
    },
  })

  // Local board state for optimistic updates
  const [localStages, setLocalStages] = useState<StageWithContacts[] | null>(null)
  const stages: StageWithContacts[] = localStages ?? data?.stages ?? []

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const findStageContaining = useCallback(
    (contactId: string) => {
      return stages.find((s) => s.contacts.some((c) => c.id === contactId))
    },
    [stages]
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const contact = active.data.current?.contact as ContactCardData
    setActiveContact(contact ?? null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    if (activeId === overId) return

    // Find source and target stages
    const sourceStage = findStageContaining(activeId)
    const targetStage = stages.find((s) => s.id === overId) ?? findStageContaining(overId)

    if (!sourceStage || !targetStage || sourceStage.id === targetStage.id) return

    // Optimistic update: move card between columns
    setLocalStages((prev) => {
      const current = prev ?? data?.stages ?? []
      const contact = current
        .flatMap((s) => s.contacts)
        .find((c) => c.id === activeId)
      if (!contact) return current

      return current.map((s) => {
        if (s.id === sourceStage.id) {
          return { ...s, contacts: s.contacts.filter((c) => c.id !== activeId) }
        }
        if (s.id === targetStage.id) {
          return { ...s, contacts: [...s.contacts, contact] }
        }
        return s
      })
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveContact(null)

    if (!over) {
      setLocalStages(null)
      return
    }

    const activeId = String(active.id)
    const overId = String(over.id)

    // Find target stage
    const targetStage =
      stages.find((s) => s.id === overId) ?? findStageContaining(overId)

    if (!targetStage) {
      setLocalStages(null)
      return
    }

    // Trigger API call
    stageMutation.mutate(
      { contactId: activeId, stageId: targetStage.id },
      {
        onSettled: () => {
          setLocalStages(null)
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex gap-3 p-4 overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="pipeline-column">
            <div className="skeleton h-10 rounded-t-lg" />
            <div className="skeleton h-64 rounded-b-lg mt-[1px]" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filters bar */}
      <PipelineFiltersBar
        pipeline={data?.pipeline}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="pipeline-board px-4 py-3 flex-1">
          {stages.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              contacts={stage.contacts}
              pipelineId={pipelineId}
              onStageChange={(contactId, stageId) =>
                stageMutation.mutate({ contactId, stageId })
              }
              onStatusChange={(contactId, status) => {
                // TODO: open modal
              }}
              onCreateTask={(contactId) => {
                // TODO: open task modal
              }}
              onAddNote={(contactId) => {
                // TODO: open note modal
              }}
            />
          ))}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeContact && <ContactCardOverlay contact={activeContact} />}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
