'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle, Circle, ChevronRight, RefreshCw, Settings,
  FileSpreadsheet, Mail, TrendingUp, ArrowRight, Loader2,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Step = 'google' | 'sheets' | 'mapping' | 'sellsy' | 'done'

const CONTACT_FIELDS = [
  { key: 'email', label: 'Email', required: true },
  { key: 'firstname', label: 'Prénom' },
  { key: 'lastname', label: 'Nom' },
  { key: 'phone', label: 'Téléphone' },
  { key: 'title', label: 'Titre / Poste' },
  { key: 'department', label: 'Département' },
  { key: 'country', label: 'Pays' },
  { key: 'org', label: 'Club / Organisation' },
  { key: 'tags', label: 'Tags (séparés par virgule)' },
  { key: 'stage', label: 'Stage pipeline (push back)' },
]

export function OnboardingWizard({ initialSettings }: { initialSettings: any }) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const [step, setStep] = useState<Step>(
    initialSettings?.sheetsEnabled ? 'done' : 'google'
  )
  const [selectedSheet, setSelectedSheet] = useState(initialSettings?.sheetId ?? '')
  const [selectedTab, setSelectedTab] = useState(initialSettings?.tabName ?? '')
  const [mapping, setMapping] = useState<Record<string, string>>(
    (initialSettings?.columnMapping as Record<string, string>) ?? {}
  )
  const [sellsyClientId, setSellsyClientId] = useState('')
  const [sellsyClientSecret, setSellsyClientSecret] = useState('')
  const [syncResult, setSyncResult] = useState<any>(null)

  // Fetch spreadsheets
  const { data: sheets, isLoading: sheetsLoading, refetch: refetchSheets } = useQuery({
    queryKey: ['spreadsheets'],
    queryFn: () =>
      fetch('/api/onboarding/sheets').then((r) => r.json()),
    enabled: step === 'sheets',
  })

  // Fetch tabs for selected sheet
  const { data: tabs, isLoading: tabsLoading } = useQuery({
    queryKey: ['tabs', selectedSheet],
    queryFn: () =>
      fetch(`/api/onboarding/sheets/tabs?sheetId=${selectedSheet}`).then((r) => r.json()),
    enabled: !!selectedSheet,
  })

  // Fetch preview headers
  const { data: headers } = useQuery({
    queryKey: ['headers', selectedSheet, selectedTab],
    queryFn: () =>
      fetch(
        `/api/onboarding/sheets/headers?sheetId=${selectedSheet}&tab=${selectedTab}`
      ).then((r) => r.json()),
    enabled: !!selectedSheet && !!selectedTab && step === 'mapping',
  })

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/onboarding/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
  })

  // Import contacts mutation
  const importMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/sync/sheets', { method: 'POST' })
      return res.json()
    },
    onSuccess: (data) => {
      setSyncResult(data)
    },
  })

  const steps = [
    { id: 'google', label: 'Google', icon: <CheckCircle className="h-4 w-4" /> },
    { id: 'sheets', label: 'Google Sheets', icon: <FileSpreadsheet className="h-4 w-4" /> },
    { id: 'mapping', label: 'Mapping colonnes', icon: <Settings className="h-4 w-4" /> },
    { id: 'sellsy', label: 'Sellsy', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'done', label: 'Prêt !', icon: <CheckCircle className="h-4 w-4" /> },
  ]

  const stepIndex = steps.findIndex((s) => s.id === step)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 mb-4">
            <span className="text-white font-bold">SC</span>
          </div>
          <h1 className="text-2xl font-bold">Configuration des intégrations</h1>
          <p className="text-muted-foreground mt-1">
            Connectez vos sources de données pour activer le Sales Command Center
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, idx) => (
            <React.Fragment key={s.id}>
              <div
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  idx === stepIndex
                    ? 'bg-indigo-600 text-white'
                    : idx < stepIndex
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {idx < stepIndex ? (
                  <CheckCircle className="h-3.5 w-3.5" />
                ) : (
                  <Circle className="h-3.5 w-3.5" />
                )}
                {s.label}
              </div>
              {idx < steps.length - 1 && (
                <div className="w-6 h-px bg-border" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border p-8 shadow-sm">

          {/* STEP: Google */}
          {step === 'google' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Connecter Google</h2>
                <p className="text-sm text-muted-foreground">
                  Votre compte Google est utilisé pour accéder à Google Sheets et Gmail.
                  Les scopes demandés sont les suivants :
                </p>
              </div>

              <div className="space-y-3">
                <ScopeItem
                  scope="spreadsheets"
                  label="Google Sheets"
                  description="Lire et écrire les données contacts"
                  icon={<FileSpreadsheet className="h-4 w-4" />}
                />
                <ScopeItem
                  scope="gmail.readonly"
                  label="Gmail (lecture seule)"
                  description="Lire les échanges emails avec vos contacts"
                  icon={<Mail className="h-4 w-4" />}
                />
                <ScopeItem
                  scope="drive.readonly"
                  label="Google Drive (lecture seule)"
                  description="Lister vos Google Sheets disponibles"
                  icon={<FileSpreadsheet className="h-4 w-4" />}
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-300">
                <strong>Note :</strong> Si vous avez déjà connecté votre compte Google lors de la connexion,
                les tokens sont déjà enregistrés. Vous pouvez passer à l'étape suivante.
              </div>

              <Button
                className="w-full"
                onClick={() => setStep('sheets')}
              >
                Continuer
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* STEP: Sheets */}
          {step === 'sheets' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Choisir la Google Sheet</h2>
                <p className="text-sm text-muted-foreground">
                  Sélectionnez la feuille de calcul contenant vos contacts.
                </p>
              </div>

              {sheetsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement des feuilles...
                </div>
              ) : (
                <div className="space-y-3">
                  <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une feuille..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sheets?.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedSheet && !tabsLoading && tabs && (
                    <Select value={selectedTab} onValueChange={setSelectedTab}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un onglet..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tabs?.map((t: any) => (
                          <SelectItem key={t.title} value={t.title ?? ''}>
                            {t.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refetchSheets()}
                    className="gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Actualiser
                  </Button>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('google')}>
                  Retour
                </Button>
                <Button
                  className="flex-1"
                  disabled={!selectedSheet || !selectedTab}
                  onClick={async () => {
                    await saveMutation.mutateAsync({
                      sheetId: selectedSheet,
                      tabName: selectedTab,
                    })
                    setStep('mapping')
                  }}
                >
                  Continuer
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP: Column Mapping */}
          {step === 'mapping' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Mapper les colonnes</h2>
                <p className="text-sm text-muted-foreground">
                  Associez les colonnes de votre Google Sheet aux champs Contact.
                </p>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {CONTACT_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center gap-3">
                    <div className="w-40 shrink-0">
                      <span className="text-sm font-medium">{field.label}</span>
                      {field.required && (
                        <span className="text-red-500 ml-0.5">*</span>
                      )}
                    </div>
                    <Select
                      value={mapping[field.key] ?? ''}
                      onValueChange={(val) =>
                        setMapping((m) => ({ ...m, [field.key]: val }))
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Aucune" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">— Ignorer —</SelectItem>
                        {headers?.map((h: string) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('sheets')}>
                  Retour
                </Button>
                <Button
                  className="flex-1"
                  onClick={async () => {
                    await saveMutation.mutateAsync({
                      columnMapping: mapping,
                      sheetsEnabled: true,
                    })
                    // Run initial import
                    importMutation.mutate()
                    setStep('sellsy')
                  }}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Enregistrer et importer
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {syncResult && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-sm text-green-800 dark:text-green-300">
                  Import terminé: {syncResult.created} créés, {syncResult.updated} mis à jour,{' '}
                  {syncResult.skipped} inchangés
                </div>
              )}
            </div>
          )}

          {/* STEP: Sellsy */}
          {step === 'sellsy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Connecter Sellsy</h2>
                <p className="text-sm text-muted-foreground">
                  Optionnel. Renseignez vos credentials Sellsy API v2 pour synchroniser
                  les opportunités.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Client ID</label>
                  <Input
                    value={sellsyClientId}
                    onChange={(e) => setSellsyClientId(e.target.value)}
                    placeholder="votre-client-id"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Client Secret</label>
                  <Input
                    type="password"
                    value={sellsyClientSecret}
                    onChange={(e) => setSellsyClientSecret(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-sm text-amber-800 dark:text-amber-300">
                <a
                  href="https://api.sellsy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Documentation API Sellsy
                </a>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('mapping')}>
                  Retour
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('done')}
                >
                  Passer
                </Button>
                <Button
                  className="flex-1"
                  disabled={!sellsyClientId || !sellsyClientSecret || saveMutation.isPending}
                  onClick={async () => {
                    await saveMutation.mutateAsync({
                      sellsyClientId,
                      sellsyClientSecret,
                      sellsyEnabled: true,
                    })
                    setStep('done')
                  }}
                >
                  {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Enregistrer
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP: Done */}
          {step === 'done' && (
            <div className="space-y-6 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">Tout est prêt !</h2>
                <p className="text-sm text-muted-foreground">
                  Vos intégrations sont configurées. Vous pouvez maintenant utiliser
                  le Sales Command Center.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <StatusCard
                  label="Google Sheets"
                  enabled={initialSettings?.sheetsEnabled}
                  icon={<FileSpreadsheet className="h-4 w-4" />}
                />
                <StatusCard
                  label="Gmail Sync"
                  enabled={initialSettings?.gmailEnabled}
                  icon={<Mail className="h-4 w-4" />}
                />
                <StatusCard
                  label="Sellsy"
                  enabled={initialSettings?.sellsyEnabled}
                  icon={<TrendingUp className="h-4 w-4" />}
                />
              </div>

              <Button asChild className="w-full">
                <Link href="/pipeline">
                  Aller au Pipeline
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ScopeItem({
  scope, label, description, icon
}: { scope: string; label: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30">
      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <Badge variant="outline" className="ml-auto shrink-0 text-[10px]">
        {scope}
      </Badge>
    </div>
  )
}

function StatusCard({ label, enabled, icon }: { label: string; enabled: boolean; icon: React.ReactNode }) {
  return (
    <div className={cn(
      'p-3 rounded-lg border flex items-center gap-2',
      enabled ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-border bg-muted/30'
    )}>
      <div className={cn('shrink-0', enabled ? 'text-green-600' : 'text-muted-foreground')}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className={cn('text-xs', enabled ? 'text-green-600' : 'text-muted-foreground')}>
          {enabled ? 'Actif' : 'Non configuré'}
        </div>
      </div>
    </div>
  )
}
