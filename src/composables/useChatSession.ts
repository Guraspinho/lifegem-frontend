import { computed, onBeforeUnmount, ref } from 'vue'
import type { Socket } from 'socket.io-client'
import { createChatSocket } from '@/api/chat.socket'
import type {
  ChatDonePayload,
  ChatMessage,
  ChatRole,
  PatientProfile,
  PatientVitals,
  SessionEndPayload,
  SessionPhase,
  SessionSpecialty,
  SessionStartedPayload,
} from '@/types/chat.types'

const ANALYSIS_TIMEOUT_MS = 60_000

let messageSeq = 0
const nextId = (): string => `m${++messageSeq}`

export function useChatSession() {
  const phase = ref<SessionPhase>('idle')
  const messages = ref<ChatMessage[]>([])
  const error = ref<string | null>(null)
  const patientThinking = ref(false)
  const patient = ref<PatientProfile | null>(null)
  const scoreHistory = ref<number[]>([])

  const score = computed<number | null>(() => {
    const h = scoreHistory.value
    return h.length ? h[h.length - 1]! : null
  })
  const scoreDelta = computed<number | null>(() => {
    const h = scoreHistory.value
    return h.length >= 2 ? h[h.length - 1]! - h[h.length - 2]! : null
  })
  const feedback = computed(() => patient.value?.shortFeedback ?? null)

  const finalDiagnosis = ref('')
  const hasDiagnosis = computed(() => finalDiagnosis.value.trim().length > 0)

  const sessionReport = ref<SessionEndPayload | null>(null)
  const analysisError = ref<string | null>(null)
  const analyzing = computed(
    () => phase.value === 'analyzing' && !sessionReport.value,
  )

  let socket: Socket | null = null
  let analysisTimer: ReturnType<typeof setTimeout> | null = null
  let streamingId: string | null = null

  function applyPatientUpdate(update: PatientVitals | PatientProfile): void {
    patient.value = patient.value
      ? { ...patient.value, ...update }
      : (update as PatientProfile)
    if (typeof update.answerAccuracy === 'number') {
      scoreHistory.value.push(update.answerAccuracy)
    }
  }

  const isConnected = computed(() => phase.value === 'active')
  const isGenerating = computed(
    () => phase.value === 'connecting' || phase.value === 'generating',
  )
  const patientAlive = computed(() => phase.value === 'active')

  function pushMessage(role: ChatRole, content: string): ChatMessage {
    const msg: ChatMessage = {
      id: nextId(),
      role,
      content,
      timestamp: Date.now(),
    }
    messages.value.push(msg)
    return msg
  }

  function streamingMessage(): ChatMessage | undefined {
    return messages.value.find((m) => m.id === streamingId)
  }

  function bindEvents(s: Socket): void {
    s.on('connect', () => {
      phase.value = 'generating'
      s.emit('start_session', { specialty: currentSpecialty })
    })

    s.on('session:start', (payload: SessionStartedPayload) => {
      phase.value = 'active'
      if (payload?.patient) applyPatientUpdate(payload.patient)
      pushMessage('system', 'Consultation started. The patient is ready.')
      if (payload?.message) pushMessage('patient', payload.message)
    })

    s.on('message:done', (payload: ChatDonePayload) => {
      patientThinking.value = false
      const target = streamingMessage()
      if (target) {
        target.content =
          payload?.outputMessage || 'The patient did not respond clearly.'
        target.pending = false
      } else if (payload?.outputMessage) {
        pushMessage('patient', payload.outputMessage)
      }
      streamingId = null
      if (payload?.patient) applyPatientUpdate(payload.patient)
    })

    s.on('session:end', (payload: SessionEndPayload) => {
      if (analysisTimer) {
        clearTimeout(analysisTimer)
        analysisTimer = null
      }
      if (payload?.review) sessionReport.value = payload
    })

    s.on('error', handleServerError)

    s.on('connect_error', (err: Error) => {
      error.value = err.message || 'Could not connect to the simulation server.'
      phase.value = 'error'
    })

    s.on('disconnect', () => {
      if (phase.value !== 'error') phase.value = 'ended'
    })
  }

  function handleServerError(payload: unknown): void {
    const message = toErrorMessage(payload)

    if (streamingId) {
      patientThinking.value = false
      const target = streamingMessage()
      if (target) {
        if (!target.content) {
          target.content = 'The patient could not respond. Please try again.'
        }
        target.pending = false
      }
      streamingId = null
      error.value = message
      return
    }

    if (phase.value === 'analyzing') {
      if (analysisTimer) {
        clearTimeout(analysisTimer)
        analysisTimer = null
      }
      analysisError.value = message
      return
    }

    error.value = message
    if (phase.value === 'connecting' || phase.value === 'generating') {
      phase.value = 'error'
    }
  }

  let currentSpecialty: SessionSpecialty = 'CARDIOLOGY'

  function start(specialty: SessionSpecialty): void {
    if (socket) return
    currentSpecialty = specialty
    error.value = null
    phase.value = 'connecting'
    socket = createChatSocket()
    bindEvents(socket)
    socket.connect()
  }

  function sendMessage(text: string): void {
    const content = text.trim()
    if (!content || !socket || phase.value !== 'active') return

    pushMessage('doctor', content)
    socket.emit('chat_message', content)

    const reply = pushMessage('patient', '')
    reply.pending = true
    streamingId = reply.id
    patientThinking.value = true
  }

  function submitDiagnosis(text: string): void {
    if (!socket || phase.value !== 'active') return
    const value = text.trim()
    finalDiagnosis.value = value
    socket.emit('final_diagnosis', value)
  }

  function requestEnd(): boolean {
    if (!socket || phase.value !== 'active') return false
    analysisError.value = null
    sessionReport.value = null
    phase.value = 'analyzing'
    socket.emit('session_end')

    analysisTimer = setTimeout(() => {
      analysisTimer = null
      if (!sessionReport.value) {
        analysisError.value =
          'The analysis is taking longer than expected. You can close this and try again later.'
      }
    }, ANALYSIS_TIMEOUT_MS)
    return true
  }

  function end(): void {
    if (analysisTimer) {
      clearTimeout(analysisTimer)
      analysisTimer = null
    }
    if (socket) {
      socket.disconnect()
      socket.removeAllListeners()
      socket = null
    }
    if (phase.value !== 'error') phase.value = 'ended'
  }

  onBeforeUnmount(end)

  return {
    phase,
    messages,
    error,
    patientThinking,
    patient,
    score,
    scoreDelta,
    scoreHistory,
    feedback,
    finalDiagnosis,
    hasDiagnosis,
    sessionReport,
    analyzing,
    analysisError,
    isConnected,
    isGenerating,
    patientAlive,
    start,
    sendMessage,
    submitDiagnosis,
    requestEnd,
    end,
  }
}

function toErrorMessage(payload: unknown): string {
  return drillMessage(payload) ?? 'Something went wrong during the session.'
}

function drillMessage(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = drillMessage(item)
      if (found) return found
    }
    return null
  }
  if (value && typeof value === 'object') {
    const obj = value as { message?: unknown; error?: unknown }
    return drillMessage(obj.message) ?? drillMessage(obj.error)
  }
  return null
}
