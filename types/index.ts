import type {
  User,
  Contact,
  Org,
  Pipeline,
  PipelineStage,
  ContactPipelineState,
  ContactStageHistory,
  Task,
  Note,
  Interaction,
  EmailThread,
  MetricsSnapshot,
  SellsyLink,
  IntegrationSettings,
} from '@prisma/client'

// ─── Extended types with relations ───────────────────────────────────────────

export type ContactWithRelations = Contact & {
  org?: Org | null
  owner?: User | null
  pipelineStates?: (ContactPipelineState & {
    currentStage: PipelineStage
    pipeline: Pipeline
  })[]
  metricsSnapshots?: MetricsSnapshot[]
  sellsyLinks?: SellsyLink[]
  _count?: {
    interactions: number
    tasks: number
    notes: number
  }
}

export type ContactCardData = Contact & {
  org?: Org | null
  owner?: Pick<User, 'id' | 'name' | 'image'> | null
  currentStage?: PipelineStage | null
  pipelineStatus?: ContactPipelineState | null
  metrics?: MetricsSnapshot | null
  sellsyLink?: SellsyLink | null
}

export type PipelineWithStages = Pipeline & {
  stages: PipelineStage[]
}

export type StageWithContacts = PipelineStage & {
  contacts: ContactCardData[]
  _count: { contacts: number }
}

export type InteractionWithContact = Interaction & {
  contact?: Contact | null
  org?: Org | null
}

export type TaskWithRelations = Task & {
  contact?: Contact | null
  org?: Org | null
  owner?: User | null
}

export type NoteWithAuthor = Note & {
  author: User
}

// ─── API response types ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// ─── Filter/Sort types ───────────────────────────────────────────────────────

export interface PipelineFilters {
  pipelineId?: string
  ownerId?: string
  stageId?: string
  status?: 'OPEN' | 'WON' | 'LOST'
  search?: string
  staleOnly?: boolean
  nextStepMissing?: boolean
  tags?: string[]
}

export interface ContactFilters {
  search?: string
  ownerId?: string
  orgId?: string
  tags?: string[]
  country?: string
  source?: string
}

// ─── Column mapping for Google Sheets ────────────────────────────────────────

export interface ColumnMapping {
  email?: string
  firstname?: string
  lastname?: string
  phone?: string
  title?: string
  department?: string
  country?: string
  org?: string      // Club/Organisation column
  owner?: string
  stage?: string    // For push-back
  tags?: string
  source?: string
  rowId?: string    // Which column to use as unique ID
}

// ─── Onboarding state ────────────────────────────────────────────────────────

export interface OnboardingState {
  step: 'google' | 'sheets' | 'mapping' | 'sellsy' | 'done'
  googleConnected: boolean
  sheetId?: string
  tabName?: string
  columnMapping?: ColumnMapping
  sellsyConnected: boolean
  importDone: boolean
}

// ─── Command palette ─────────────────────────────────────────────────────────

export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  shortcut?: string[]
  action: () => void
  group?: string
}

// ─── Analytics types ─────────────────────────────────────────────────────────

export interface FunnelMetrics {
  stageId: string
  stageName: string
  stageColor: string
  count: number
  conversionRate?: number
  avgDays?: number
}

export interface OwnerPerformance {
  userId: string
  userName: string
  userImage?: string
  contactsTotal: number
  contactsActive: number
  demosCount: number
  meetingsCount: number
  replyRate: number
  wonsCount: number
}

export interface TimelineEvent {
  id: string
  type: string
  label: string
  date: Date
  description?: string
  icon?: string
  color?: string
}

// ─── Next.js session extension ───────────────────────────────────────────────

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
    }
  }
}
