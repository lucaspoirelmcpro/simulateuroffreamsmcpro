'use client'

import React from 'react'
import { Pipeline } from '@prisma/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, AlertTriangle, Clock, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'

interface PipelineFiltersBarProps {
  pipeline?: Pipeline
  filters: Record<string, string>
  onFiltersChange: (filters: Record<string, string>) => void
}

export function PipelineFiltersBar({ pipeline, filters, onFiltersChange }: PipelineFiltersBarProps) {
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/sync/sheets', { method: 'POST' })
      return res.json()
    },
  })

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-20">
      {/* Pipeline name */}
      {pipeline && (
        <span className="text-sm font-semibold text-foreground shrink-0">
          {pipeline.name}
        </span>
      )}

      <div className="h-4 w-px bg-border" />

      {/* Search */}
      <div className="relative flex-1 max-w-64">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Rechercher..."
          className="pl-8 h-8 text-sm"
          value={filters.search ?? ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
        />
      </div>

      {/* Quick filters */}
      <div className="flex items-center gap-1.5">
        <FilterToggle
          label="Stale"
          icon={<AlertTriangle className="h-3 w-3" />}
          active={filters.staleOnly === 'true'}
          onClick={() =>
            onFiltersChange({
              ...filters,
              staleOnly: filters.staleOnly === 'true' ? '' : 'true',
            })
          }
          variant="warning"
        />
        <FilterToggle
          label="No next step"
          icon={<Clock className="h-3 w-3" />}
          active={filters.nextStepMissing === 'true'}
          onClick={() =>
            onFiltersChange({
              ...filters,
              nextStepMissing:
                filters.nextStepMissing === 'true' ? '' : 'true',
            })
          }
          variant="destructive"
        />
      </div>

      {/* Sync button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-xs ml-auto"
        onClick={() => syncMutation.mutate()}
        disabled={syncMutation.isPending}
      >
        <RefreshCw className={cn('h-3.5 w-3.5', syncMutation.isPending && 'animate-spin')} />
        Sync Sheets
      </Button>

      {/* Active filters count */}
      {Object.values(filters).filter(Boolean).length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground"
          onClick={() => onFiltersChange({})}
        >
          Effacer filtres
        </Button>
      )}
    </div>
  )
}

function FilterToggle({
  label,
  icon,
  active,
  onClick,
  variant,
}: {
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void
  variant: 'warning' | 'destructive'
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 text-xs px-2 py-1 rounded-md border transition-all font-medium',
        active
          ? variant === 'warning'
            ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700'
            : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
          : 'bg-transparent text-muted-foreground border-border hover:border-input hover:text-foreground'
      )}
    >
      {icon}
      {label}
    </button>
  )
}
