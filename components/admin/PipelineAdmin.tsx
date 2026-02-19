'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DndContext, DragEndEvent, PointerSensor, useSensor, useSensors,
  closestCorners
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import {
  Plus, GripVertical, Pencil, Trash2, CheckSquare, AlertTriangle,
  Mail, Settings, ChevronRight
} from 'lucide-react'

const STAGE_COLORS = [
  '#94a3b8', '#60a5fa', '#a78bfa', '#f59e0b',
  '#f97316', '#ef4444', '#22c55e', '#6b7280',
  '#06b6d4', '#ec4899', '#8b5cf6', '#10b981',
]

export function PipelineAdmin({ pipelines }: { pipelines: any[] }) {
  const router = useRouter()
  const [selectedPipelineId, setSelectedPipelineId] = useState(
    pipelines.find((p: any) => p.isDefault)?.id ?? pipelines[0]?.id
  )
  const [editingStage, setEditingStage] = useState<any>(null)
  const [showNewStage, setShowNewStage] = useState(false)
  const [showNewPipeline, setShowNewPipeline] = useState(false)

  const selectedPipeline = pipelines.find((p: any) => p.id === selectedPipelineId)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const createStageMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/stages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => router.refresh(),
  })

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await fetch(`/api/stages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => { setEditingStage(null); router.refresh() },
  })

  const deleteStageMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/stages/${id}`, { method: 'DELETE' })
      return res.json()
    },
    onSuccess: () => router.refresh(),
  })

  const createPipelineMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => { setShowNewPipeline(false); router.refresh() },
  })

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const stages = selectedPipeline?.stages ?? []
    const oldIdx = stages.findIndex((s: any) => s.id === active.id)
    const newIdx = stages.findIndex((s: any) => s.id === over.id)

    if (oldIdx === -1 || newIdx === -1) return

    // Reorder and update
    const newStages = [...stages]
    const [moved] = newStages.splice(oldIdx, 1)
    newStages.splice(newIdx, 0, moved)

    // Update orders
    for (let i = 0; i < newStages.length; i++) {
      await fetch(`/api/stages/${newStages[i].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: i }),
      })
    }
    router.refresh()
  }

  return (
    <div className="flex h-full">
      {/* Left: pipeline list */}
      <div className="w-64 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Pipelines</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowNewPipeline(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {pipelines.map((pipeline: any) => (
            <button
              key={pipeline.id}
              onClick={() => setSelectedPipelineId(pipeline.id)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                selectedPipelineId === pipeline.id
                  ? 'bg-indigo-100 text-indigo-700 font-medium dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'text-foreground hover:bg-accent'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{pipeline.name}</span>
                {pipeline.isDefault && (
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                    Défaut
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {pipeline.stages?.length ?? 0} stages · {pipeline._count?.contactStates ?? 0} contacts
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: stages editor */}
      <div className="flex-1 overflow-auto">
        {selectedPipeline ? (
          <div className="p-6 space-y-6">
            {/* Pipeline header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">{selectedPipeline.name}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Type: {selectedPipeline.stageType} · {selectedPipeline.stages?.length} stages
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Settings className="h-3.5 w-3.5" />
                  Paramètres
                </Button>
                <Button size="sm" className="gap-1.5" onClick={() => setShowNewStage(true)}>
                  <Plus className="h-3.5 w-3.5" />
                  Nouveau stage
                </Button>
              </div>
            </div>

            <Separator />

            {/* Stages list with drag & drop */}
            <div>
              <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                <GripVertical className="h-3.5 w-3.5" />
                Glisser pour réordonner
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={selectedPipeline.stages?.map((s: any) => s.id) ?? []}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {selectedPipeline.stages?.map((stage: any) => (
                      <SortableStageRow
                        key={stage.id}
                        stage={stage}
                        onEdit={() => setEditingStage(stage)}
                        onDelete={() => {
                          if (confirm(`Supprimer le stage "${stage.name}" ?`)) {
                            deleteStageMutation.mutate(stage.id)
                          }
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {/* Stage rules info */}
            <div className="bg-muted/30 rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-2">Règles de stage</h3>
              <p className="text-xs text-muted-foreground">
                Vous pouvez configurer des exigences pour chaque stage (owner requis,
                next step obligatoire, email valide). Ces règles seront vérifiées
                lors du passage d'un contact dans ce stage.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Sélectionnez un pipeline
          </div>
        )}
      </div>

      {/* Edit stage dialog */}
      {editingStage && (
        <StageEditDialog
          stage={editingStage}
          onClose={() => setEditingStage(null)}
          onSave={(data) => updateStageMutation.mutate({ id: editingStage.id, ...data })}
          isPending={updateStageMutation.isPending}
        />
      )}

      {/* New stage dialog */}
      {showNewStage && (
        <StageEditDialog
          stage={{ name: '', color: '#6366f1', order: (selectedPipeline?.stages?.length ?? 0) }}
          onClose={() => setShowNewStage(false)}
          onSave={(data) => createStageMutation.mutate({ ...data, pipelineId: selectedPipelineId })}
          isPending={createStageMutation.isPending}
        />
      )}

      {/* New pipeline dialog */}
      {showNewPipeline && (
        <NewPipelineDialog
          onClose={() => setShowNewPipeline(false)}
          onSave={(data) => createPipelineMutation.mutate(data)}
          isPending={createPipelineMutation.isPending}
        />
      )}
    </div>
  )
}

function SortableStageRow({ stage, onEdit, onDelete }: any) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging
  } = useSortable({ id: stage.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-border rounded-lg group',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-indigo-400'
      )}
    >
      {/* Drag handle */}
      <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Color dot */}
      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />

      {/* Name */}
      <span className="flex-1 text-sm font-medium">{stage.name}</span>

      {/* Requirements badges */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {stage.requiresOwner && (
          <Badge variant="outline" className="h-4 px-1.5 text-[10px]">Owner requis</Badge>
        )}
        {stage.requiresNextStep && (
          <Badge variant="outline" className="h-4 px-1.5 text-[10px]">Next step requis</Badge>
        )}
        {stage.requiresEmail && (
          <Badge variant="outline" className="h-4 px-1.5 text-[10px]">Email requis</Badge>
        )}
      </div>

      {/* Order */}
      <span className="text-xs text-muted-foreground w-6 text-center">#{stage.order + 1}</span>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

function StageEditDialog({ stage, onClose, onSave, isPending }: any) {
  const [name, setName] = useState(stage.name ?? '')
  const [color, setColor] = useState(stage.color ?? '#6366f1')
  const [requiresOwner, setRequiresOwner] = useState(stage.requiresOwner ?? false)
  const [requiresNextStep, setRequiresNextStep] = useState(stage.requiresNextStep ?? false)
  const [requiresEmail, setRequiresEmail] = useState(stage.requiresEmail ?? false)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{stage.id ? 'Modifier le stage' : 'Nouveau stage'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium">Nom du stage</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Qualification"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Couleur</label>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {STAGE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-6 h-6 rounded-full transition-all',
                    color === c && 'ring-2 ring-offset-2 ring-indigo-500 scale-110'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Exigences pour ce stage</label>
            <div className="space-y-2">
              {[
                { key: 'requiresOwner', label: 'Owner assigné', state: requiresOwner, set: setRequiresOwner },
                { key: 'requiresNextStep', label: 'Next step défini', state: requiresNextStep, set: setRequiresNextStep },
                { key: 'requiresEmail', label: 'Email valide', state: requiresEmail, set: setRequiresEmail },
              ].map((req) => (
                <label key={req.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={req.state}
                    onChange={(e) => req.set(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm">{req.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button
            disabled={!name || isPending}
            onClick={() => onSave({ name, color, requiresOwner, requiresNextStep, requiresEmail })}
          >
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function NewPipelineDialog({ onClose, onSave, isPending }: any) {
  const [name, setName] = useState('')
  const [stageType, setStageType] = useState('PROSPECTING')

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau pipeline</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium">Nom du pipeline</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Prospection Ligue 1"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Type</label>
            <Select value={stageType} onValueChange={setStageType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PROSPECTING">Prospection</SelectItem>
                <SelectItem value="RENEWAL">Renouvellement</SelectItem>
                <SelectItem value="PARTNERSHIP">Partenariat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button
            disabled={!name || isPending}
            onClick={() => onSave({ name, stageType })}
          >
            {isPending ? 'Création...' : 'Créer avec stages par défaut'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
