import type { QuickAction, SessionSpecialty } from '@/types/chat.types'

export const sessionSpecialtyById: Record<string, SessionSpecialty> = {
  traumatology: 'TRAUMATOLOGY',
  cardiology: 'CARDIOLOGY',
  emergency: 'EMERGENCY_MEDICINE',
}

export const quickActions: QuickAction[] = [
  {
    id: 'history',
    label: 'Take history',
    prompt: "Hello, I'm your doctor. Can you tell me what brings you in today?",
    icon: 'history',
  },
  {
    id: 'pain',
    label: 'Assess pain',
    prompt:
      'Can you describe the pain for me, where it is, how severe, and when it started?',
    icon: 'pain',
  },
  {
    id: 'vitals',
    label: 'Check vitals',
    prompt: "I'm going to check your vital signs now, please stay still.",
    icon: 'vitals',
  },
  {
    id: 'meds',
    label: 'Medical history',
    prompt:
      'Do you have any existing medical conditions, allergies, or medications you take regularly?',
    icon: 'meds',
  },
  {
    id: 'exam',
    label: 'Physical exam',
    prompt: "I'd like to perform a brief physical examination, is that alright?",
    icon: 'exam',
  },
  {
    id: 'labs',
    label: 'Order labs',
    prompt:
      "I'm going to order some lab tests to understand what's going on. ",
    icon: 'labs',
  },
]
