/**
 * Hardcoded demo data for the dashboard.
 *
 * Backend integration is incomplete, so the dashboard renders these static
 * placeholders to look production-ready. When the API lands, replace these
 * exports with data fetched into a store/composable; the shapes already match
 * `@/types/dashboard.types`, so the components won't need to change.
 */
import type { Specialty } from '@/types/dashboard.types'

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
