import type { SpecialtyAccent } from '@/types/dashboard.types'

const ACCENT_BY_SPECIALTY: Record<string, SpecialtyAccent> = {
  CARDIOLOGY: 'indigo',
  TRAUMATOLOGY: 'red',
  EMERGENCY_MEDICINE: 'cyan',
}

export function specialtyAccent(specialty: string): SpecialtyAccent {
  return ACCENT_BY_SPECIALTY[specialty] ?? 'indigo'
}

export function specialtyLabel(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function statusLabel(status: string): string {
  if (status === 'ACTIVE') return 'In progress'
  return specialtyLabel(status)
}

export function formatSessionDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDuration(seconds: number | null): string {
  if (seconds === null) return '—'
  const total = Math.max(0, Math.round(seconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function scoreBadgeClass(score: number): string {
  if (score >= 85)
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
  if (score >= 70)
    return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
  return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
}
