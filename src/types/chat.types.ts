export type ChatRole = 'doctor' | 'patient' | 'system'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  pending?: boolean
  timestamp: number
}

export type SessionPhase =
  | 'idle'
  | 'connecting'
  | 'generating'
  | 'active'
  | 'analyzing'
  | 'ended'
  | 'error'

export type SessionSpecialty =
  | 'TRAUMATOLOGY'
  | 'CARDIOLOGY'
  | 'EMERGENCY_MEDICINE'

export interface StartSessionPayload {
  specialty: SessionSpecialty
}

export interface PatientVitals {
  heartRate: number
  bloodPressure: string
  spO2: number
  painLevel: number
  patientStatus: string
  answerAccuracy: number
  shortFeedback: string
}

export interface PatientProfile extends PatientVitals {
  patientName: string
  patientAge: number
  patientGender: string
  weight: number
  knownAllergies: string
  condition: string
}

export interface SessionStartedPayload {
  message: string
  patient: PatientProfile
}

export interface ChatDonePayload {
  outputMessage: string
  patient: PatientVitals
}

export interface ReviewDiagnosis {
  correct: boolean
  actualCondition: string
  traineeDiagnosis: string
  notes: string
}

export interface FinalReview {
  overallPerformance: string
  whatWentWell: string[]
  whatCouldBeImproved: string[]
  keyLearningPoints: string[]
  finalScore: number
  scoreJustification: string
  diagnosis: ReviewDiagnosis
}

export interface SessionEndPayload {
  review: FinalReview
  score: number
  stepScores: number[]
  patientSurvived: boolean
  durationSeconds: number
  finalDiagnosis: string
}

export interface QuickAction {
  id: string
  label: string
  prompt: string
  icon: 'history' | 'vitals' | 'pain' | 'meds' | 'exam' | 'labs'
}
