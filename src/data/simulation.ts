/**
 * Static simulation data. Quick actions are one-tap clinical prompts shown above
 * the chat composer so the trainee can drive a consultation without typing the
 * common openers. The `prompt` is sent verbatim as a doctor `chat_message`.
 */
import type { QuickAction, SessionSpecialty } from '@/types/chat.types'

/**
 * Maps a dashboard specialty id (see `@/data/dashboard`) to the backend
 * `SessionSpecialtyEnum` value sent in the `start_session` event. Kept here so
 * the mapping lives next to the simulation transport concerns.
 */
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
