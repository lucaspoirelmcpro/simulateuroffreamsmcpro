'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'

interface Pipeline {
  id: string
  name: string
  stageType: string
  isDefault: boolean
}

export function PipelineSwitcher({
  pipelines,
  currentId,
}: {
  pipelines: Pipeline[]
  currentId: string
}) {
  const router = useRouter()

  return (
    <Select
      value={currentId}
      onValueChange={(id) => router.push(`/pipeline?pipeline=${id}`)}
    >
      <SelectTrigger className="w-64 h-8 text-sm font-semibold border-none bg-transparent hover:bg-accent">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {pipelines.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            <div className="flex items-center gap-2">
              <span>{p.name}</span>
              {p.isDefault && (
                <span className="text-[10px] text-muted-foreground bg-muted px-1 rounded">
                  Défaut
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
