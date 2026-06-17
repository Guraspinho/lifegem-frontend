export type SpecialtyAccent = 'red' | 'indigo' | 'cyan'

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export interface Specialty {
  id: string
  title: string
  description: string
  topics: string[]
  difficulty: Difficulty
  duration: string
  accent: SpecialtyAccent
  icon: 'trauma' | 'cardiology' | 'emergency'
}

export interface DashboardStat {
  id: string
  label: string
  value: number | null
  unit?: string
  icon: 'pulse' | 'target' | 'shield' | 'check'
}

export interface DashboardUser {
  name: string
  role?: string
  initials: string
}
