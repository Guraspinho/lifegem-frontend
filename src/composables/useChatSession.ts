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
  SessionResult,
  SessionSpecialty,
  SessionStartedPayload,
} from '@/types/chat.types'

/** How long to wait for the server's analysis before showing a timeout. */
const ANALYSIS_TIMEOUT_MS = 60_000

/** Monotonic id source for chat bubbles (unique within a page session). */
let messageSeq = 0
const nextId = (): string => `m${++messageSeq}`

/**
 * Owns one live simulation session: the Socket.IO connection, the message log,
 * and the lifecycle phase that drives the UI (loader → active → ended).
 *
 * View-scoped on purpose: instantiate it in `SimulationView` and it tears the
 * socket down on unmount. Disconnecting is meaningful to the backend: it ends
 * the session and kicks off the analysis step.
 */
export function useChatSession() {
  const phase = ref<SessionPhase>('idle')
  const messages = ref<ChatMessage[]>([])
  const error = ref<string | null>(null)
  /** True while we're awaiting the patient's reply to the latest message. */
  const patientThinking = ref(false)
  /** The generated patient's profile + vitals; null until `session:start`. */
  const patient = ref<PatientProfile | null>(null)
  /** Diagnostic-accuracy score per turn (0–100); drives the live evaluation. */
  const scoreHistory = ref<number[]>([])

  /** Latest accuracy score, or null before the session starts. */
  const score = computed<number | null>(() => {
    const h = scoreHistory.value
    return h.length ? h[h.length - 1]! : null
  })
  /** Change vs the previous turn (chess-eval style delta). */
  const scoreDelta = computed<number | null>(() => {
    const h = scoreHistory.value
    return h.length >= 2 ? h[h.length - 1]! - h[h.length - 2]! : null
  })
  /** Latest one-line coaching feedback from the patient turn. */
  const feedback = computed(() => patient.value?.shortFeedback ?? null)

  /**
   * The last-submitted final diagnosis. Editable for the whole session; the
   * server persists this value on disconnect. Empty means none was submitted.
   */
  const finalDiagnosis = ref('')
  /** True once a non-empty diagnosis has been submitted to the server. */
  const hasDiagnosis = computed(() => finalDiagnosis.value.trim().length > 0)

  /** The server's end-of-session analysis; null until `session:end` arrives. */
  const sessionResult = ref<SessionResult | null>(null)
  /** Per-turn accuracy scores for the results chart. */
  const sessionScores = ref<number[]>([])
  /** Set if the analysis request times out (the server failed silently). */
  const analysisError = ref<string | null>(null)
  /** True while waiting for the analysis after requesting the end. */
  const analyzing = computed(
    () => phase.value === 'analyzing' && !sessionResult.value,
  )

  let socket: Socket | null = null
  /** Pending analysis-timeout handle, cleared on result or teardown. */
  let analysisTimer: ReturnType<typeof setTimeout> | null = null
  /** Id of the pending patient bubble awaiting a reply, if any. */
  let streamingId: string | null = null

  /** Merge per-turn vitals into the patient profile and record the score. */
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
  /** The simulated patient is "alive" once generated; drives the heartbeat. */
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

  /** Find the in-flight patient bubble we're streaming tokens into. */
  function streamingMessage(): ChatMessage | undefined {
    return messages.value.find((m) => m.id === streamingId)
  }

  /* ---------------------------------------------------------------------- */
  /*  Socket event wiring                                                   */
  /* ---------------------------------------------------------------------- */

  function bindEvents(s: Socket): void {
    s.on('connect', () => {
      // Connected and authenticated; ask the backend to generate the patient.
      phase.value = 'generating'
      s.emit('start_session', { specialty: currentSpecialty })
    })

    // Patient generation finished, chat is live. Capture the patient profile
    // (incl. the opening accuracy score) and show the opening line.
    s.on('session:start', (payload: SessionStartedPayload) => {
      phase.value = 'active'
      if (payload?.patient) applyPatientUpdate(payload.patient)
      pushMessage('system', 'Consultation started. The patient is ready.')
      if (payload?.message) pushMessage('patient', payload.message)
    })

    // Reply complete: fill the pending bubble, refresh vitals + score.
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

    // Analysis complete: store the report. The socket stays open until the
    // user closes the results window (which calls `end`).
    s.on('session:end', (payload: SessionEndPayload) => {
      if (analysisTimer) {
        clearTimeout(analysisTimer)
        analysisTimer = null
      }
      if (payload?.response) sessionResult.value = payload.response
      sessionScores.value = Array.isArray(payload?.scores) ? payload.scores : []
    })

    s.on('chat:error', (payload: { message?: unknown }) => {
      patientThinking.value = false
      const target = streamingMessage()
      if (target && !target.content) {
        target.content = 'The patient could not respond. Please try again.'
        target.pending = false
      }
      streamingId = null
      error.value = normaliseError(payload?.message)
    })

    // Connection / auth failures emitted by the gateway service.
    s.on('error', (reason: unknown) => {
      error.value = normaliseError(reason)
      phase.value = 'error'
    })

    s.on('connect_error', (err: Error) => {
      error.value = err.message || 'Could not connect to the simulation server.'
      phase.value = 'error'
    })

    s.on('disconnect', () => {
      // Only treat as "ended" if we weren't already in an error state.
      if (phase.value !== 'error') phase.value = 'ended'
    })
  }

  /* ---------------------------------------------------------------------- */
  /*  Public actions                                                        */
  /* ---------------------------------------------------------------------- */

  let currentSpecialty: SessionSpecialty = 'CARDIOLOGY'

  /** Open the socket and start a session for the given specialty. */
  function start(specialty: SessionSpecialty): void {
    if (socket) return // already started
    currentSpecialty = specialty
    error.value = null
    phase.value = 'connecting'
    socket = createChatSocket()
    bindEvents(socket)
    socket.connect()
  }

  /** Send a doctor message and open a pending patient bubble for the reply. */
  function sendMessage(text: string): void {
    const content = text.trim()
    if (!content || !socket || phase.value !== 'active') return

    pushMessage('doctor', content)
    socket.emit('chat_message', content)

    // Pre-create the patient bubble so the reply has somewhere to land.
    const reply = pushMessage('patient', '')
    reply.pending = true
    streamingId = reply.id
    patientThinking.value = true
  }

  /**
   * Save the working final diagnosis. Pushes the latest text to the server
   * (which persists it on disconnect) and updates the local copy. May be empty.
   */
  function submitDiagnosis(text: string): void {
    if (!socket || phase.value !== 'active') return
    const value = text.trim()
    finalDiagnosis.value = value
    socket.emit('final_diagnosis', value)
  }

  /**
   * Request the end-of-session analysis. Emits `session_end` and moves into the
   * "analyzing" phase; the report arrives on `session:end`. Returns false when
   * there's nothing to analyse (no live session) so the caller can just leave.
   */
  function requestEnd(): boolean {
    if (!socket || phase.value !== 'active') return false
    analysisError.value = null
    sessionResult.value = null
    phase.value = 'analyzing'
    socket.emit('session_end')

    // The backend swallows analysis errors (logs only), so guard with a timeout
    // rather than waiting forever on a result that may never come.
    analysisTimer = setTimeout(() => {
      analysisTimer = null
      if (!sessionResult.value) {
        analysisError.value =
          'The analysis is taking longer than expected. You can close this and try again later.'
      }
    }, ANALYSIS_TIMEOUT_MS)
    return true
  }

  /** Close the socket. Called once the user dismisses the results window. */
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
    // state
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
    sessionResult,
    sessionScores,
    analyzing,
    analysisError,
    isConnected,
    isGenerating,
    patientAlive,
    // actions
    start,
    sendMessage,
    submitDiagnosis,
    requestEnd,
    end,
  }
}

/** Coerce an unknown error payload into a displayable string. */
function normaliseError(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'message' in value) {
    const m = (value as { message?: unknown }).message
    if (typeof m === 'string') return m
  }
  return 'Something went wrong during the session.'
}
