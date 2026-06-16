/**
 * Dashboard view-model contracts. These describe the shape of the data the
 * dashboard renders. For now the values are hardcoded demo data (see
 * `@/data/dashboard`); once the backend exists these same shapes will be
 * populated from API responses, so keep them framework-agnostic.
 */

/** Accent colour key shared by a specialty card and its related sessions. */
export type SpecialtyAccent = 'red' | 'indigo' | 'cyan'

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export interface Specialty {
  id: string
  title: string
  /** One-line summary shown under the title. */
  description: string
  /** Short list of scenario keywords for flavour. */
  topics: string[]
  difficulty: Difficulty
  /** Estimated session length, e.g. "20–30 min". */
  duration: string
  accent: SpecialtyAccent
  /** Key into the icon set rendered by SpecialtyCard. */
  icon: 'trauma' | 'cardiology' | 'emergency'
}

export interface RecentSession {
  id: string
  specialty: string
  /** The simulated patient's presenting condition. */
  condition: string
  score: number
  /** Human-readable completion date. */
  date: string
  accent: SpecialtyAccent
}

export interface DashboardStat {
  id: string
  label: string
  /** Numeric value, or null when there's no data yet (e.g. no sessions). */
  value: number | null
  /** Optional suffix appended to a non-null value, e.g. '%'. */
  unit?: string
  icon: 'pulse' | 'target' | 'shield' | 'check'
}

export interface DashboardUser {
  name: string
  /** Optional descriptor under the name; omitted when unknown. */
  role?: string
  /** Initials shown in the avatar fallback. */
  initials: string
}
