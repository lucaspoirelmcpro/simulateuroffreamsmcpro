'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  Layers, BarChart2, Settings, Search, Plus, RefreshCw,
  Users, Building2, Star, Keyboard
} from 'lucide-react'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // Open on Cmd+K or /
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
        return
      }

      // Global shortcuts (only when not in input/textarea)
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      // / = open palette
      if (e.key === '/') {
        e.preventDefault()
        setOpen(true)
        return
      }

      // g + p = pipeline
      if (e.key === 'p' && (window as any).__g_pressed) {
        e.preventDefault()
        router.push('/pipeline')
        setOpen(false)
        ;(window as any).__g_pressed = false
        return
      }

      // g + a = analytics
      if (e.key === 'a' && (window as any).__g_pressed) {
        e.preventDefault()
        router.push('/analytics')
        setOpen(false)
        ;(window as any).__g_pressed = false
        return
      }

      // g = set flag
      if (e.key === 'g') {
        ;(window as any).__g_pressed = true
        setTimeout(() => { ;(window as any).__g_pressed = false }, 1000)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [router])

  const run = useCallback((action: () => void) => {
    action()
    setOpen(false)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 gap-0 max-w-xl overflow-hidden">
        <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2.5 [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4">
          <div className="flex items-center border-b px-3 gap-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input placeholder="Rechercher ou executer une commande..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground h-12 border-none ring-0 focus:ring-0" />
            <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
              esc
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              Aucun résultat
            </Command.Empty>

            <Command.Group heading="Navigation">
              <CommandItem
                icon={<Layers />}
                label="Pipeline"
                description="Vue pipeline commercial"
                shortcut="G P"
                onSelect={() => run(() => router.push('/pipeline'))}
              />
              <CommandItem
                icon={<BarChart2 />}
                label="Analytics"
                description="Dashboard performance"
                shortcut="G A"
                onSelect={() => run(() => router.push('/analytics'))}
              />
              <CommandItem
                icon={<Settings />}
                label="Admin Pipeline"
                description="Gérer stages et pipelines"
                onSelect={() => run(() => router.push('/admin/pipeline'))}
              />
            </Command.Group>

            <Command.Group heading="Actions">
              <CommandItem
                icon={<Plus />}
                label="Nouveau contact"
                description="Créer un contact manuellement"
                shortcut="N"
                onSelect={() => run(() => {/* TODO: open contact modal */})}
              />
              <CommandItem
                icon={<RefreshCw />}
                label="Sync Google Sheets"
                description="Importer les contacts depuis Sheets"
                onSelect={() => run(async () => {
                  await fetch('/api/sync/sheets', { method: 'POST' })
                })}
              />
              <CommandItem
                icon={<RefreshCw />}
                label="Sync Gmail"
                description="Synchroniser les emails"
                onSelect={() => run(async () => {
                  await fetch('/api/sync/gmail', { method: 'POST' })
                })}
              />
            </Command.Group>

            <Command.Group heading="Raccourcis">
              <CommandItem
                icon={<Keyboard />}
                label="Filtres (F)"
                description="Focus sur la recherche"
                shortcut="F"
                onSelect={() => run(() => {
                  const input = document.querySelector<HTMLInputElement>('input[placeholder*="Rechercher"]')
                  input?.focus()
                })}
              />
            </Command.Group>
          </Command.List>

          <div className="border-t px-3 py-2 flex items-center gap-4 text-[10px] text-muted-foreground">
            <span>↑↓ Naviguer</span>
            <span>↵ Sélectionner</span>
            <span>Esc Fermer</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandItem({
  icon,
  label,
  description,
  shortcut,
  onSelect,
}: {
  icon: React.ReactNode
  label: string
  description?: string
  shortcut?: string
  onSelect: () => void
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-3 rounded-md cursor-pointer aria-selected:bg-accent"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background text-muted-foreground shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </div>
      {shortcut && (
        <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono shrink-0">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  )
}
