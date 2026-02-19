import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr })
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'dd/MM/yyyy', { locale: fr })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr })
}

export function daysSince(date: Date | string | null | undefined): number | null {
  if (!date) return null
  return differenceInDays(new Date(), new Date(date))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '…'
}

// Simple hash for detecting row changes in Google Sheets
export function hashRow(row: Record<string, string>): string {
  const str = JSON.stringify(row)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash.toString(36)
}

export function stageColor(color: string): string {
  return color ?? '#6366f1'
}

// Calculate pipeline health score (0-100)
export function calcHealthScore({
  staleFlag,
  nextStepMissing,
  replyDetected,
  daysSinceLastActivity,
  demosCount,
  nextMeetingAt,
}: {
  staleFlag: boolean
  nextStepMissing: boolean
  replyDetected: boolean
  daysSinceLastActivity: number | null
  demosCount: number
  nextMeetingAt: Date | null | undefined
}): number {
  let score = 60

  if (staleFlag) score -= 25
  if (nextStepMissing) score -= 15
  if (replyDetected) score += 10
  if (demosCount > 0) score += 15
  if (nextMeetingAt && new Date(nextMeetingAt) > new Date()) score += 15
  if (daysSinceLastActivity !== null && daysSinceLastActivity < 7) score += 5
  if (daysSinceLastActivity !== null && daysSinceLastActivity > 30) score -= 10

  return Math.max(0, Math.min(100, score))
}
