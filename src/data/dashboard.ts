/**
 * Hardcoded demo data for the dashboard.
 *
 * Backend integration is incomplete, so the dashboard renders these static
 * placeholders to look production-ready. When the API lands, replace these
 * exports with data fetched into a store/composable — the shapes already match
 * `@/types/dashboard.types`, so the components won't need to change.
 */
import type { RecentSession, Specialty } from '@/types/dashboard.types'

export const specialties: Specialty[] = [
  {
    id: 'traumatology',
    title: 'Traumatology',
    description: 'Emergency injury and trauma treatment.',
    topics: ['Fractures', 'Hemorrhage control', 'Accident response'],
    difficulty: 'Advanced',
    duration: '25–35 min',
    accent: 'red',
    icon: 'trauma',
  },
  {
    id: 'cardiology',
    title: 'Cardiology',
    description: 'Heart-related emergencies and diagnostic reasoning.',
    topics: ['Chest pain', 'Arrhythmia', 'Myocardial infarction'],
    difficulty: 'Intermediate',
    duration: '20–30 min',
    accent: 'indigo',
    icon: 'cardiology',
  },
  {
    id: 'emergency',
    title: 'Emergency Medicine',
    description: 'Emergency department decision-making.',
    topics: ['Unstable vitals', 'Triage', 'Critical patients'],
    difficulty: 'Advanced',
    duration: '30–40 min',
    accent: 'cyan',
    icon: 'emergency',
  },
]

export const recentSessions: RecentSession[] = [
  {
    id: 's-1042',
    specialty: 'Cardiology',
    condition: 'Acute Myocardial Infarction',
    score: 82,
    date: 'May 27, 2026',
    accent: 'indigo',
  },
  {
    id: 's-1039',
    specialty: 'Emergency Medicine',
    condition: 'Polytrauma Case',
    score: 91,
    date: 'May 24, 2026',
    accent: 'cyan',
  },
  {
    id: 's-1031',
    specialty: 'Traumatology',
    condition: 'Open Tibial Fracture',
    score: 76,
    date: 'May 20, 2026',
    accent: 'red',
  },
  {
    id: 's-1024',
    specialty: 'Cardiology',
    condition: 'Atrial Fibrillation',
    score: 88,
    date: 'May 17, 2026',
    accent: 'indigo',
  },
]
