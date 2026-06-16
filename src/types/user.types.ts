import type { FinalReview, PatientVitals } from './chat.types'

export interface GetUserResponseDto {
  name: string
  surname: string
  completed_simulations: number
  average_score: number | null
  survival_rate: number | null
  correct_diagnosis_rate: number | null
}

export interface UserSession {
  id: number
  specialty: string
  status: string
  score: number | null
  patient_survived: boolean | null
  correct_diagnosis: boolean | null
  duration_seconds: number | null
  patient_name: string | null
  condition: string | null
  final_diagnosis: string | null
  createdAt: string
}

export interface GetUserSessionsResponse {
  sessions: UserSession[]
  nextCursor: number | null
}

export interface GetUserSessionsParams {
  cursor?: number
  limit?: number
}

export interface SessionHistoryEntry {
  userMessage: string | null
  systemMessage: string
  vitals: PatientVitals
}

export interface UserSessionDetail {
  id: number
  specialty: string
  status: string
  score: number | null
  patient_survived: boolean | null
  correct_diagnosis: boolean | null
  duration_seconds: number | null
  patient_name: string | null
  patient_age: number | null
  patient_gender: string | null
  patient_weight: number | null
  known_allergies: string | null
  condition: string | null
  final_diagnosis: string | null
  createdAt: string
  systemAnalysis: FinalReview | null
  history: SessionHistoryEntry[]
}
