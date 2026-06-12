import { computed, onBeforeUnmount, ref } from 'vue'
import type { Socket } from 'socket.io-client'
import { createChatSocket } from '@/api/chat.socket'
import type {
  ChatMessage,
  ChatRole,
  PatientVitals,
  SessionPhase,
  SessionSpecialty,
  SessionStartedPayload,
} from '@/types/chat.types'

/** Monotonic id source for chat bubbles (unique within a page session). */
let messageSeq = 0
const nextId = (): string => `m${++messageSeq}`

/**
 * Owns one live simulation session: the Socket.IO connection, the message log,
 * and the lifecycle phase that drives the UI (loader → active → ended).
 *
 * View-scoped on purpose — instantiate it in `SimulationView` and it tears the
 * socket down on unmount. Disconnecting is meaningful to the backend: it ends
 * the session and kicks off the analysis step.
 */
export function useChatSession() {
  const phase = ref<SessionPhase>('idle')
  const messages = ref<ChatMessage[]>([])
  const error = ref<string | null>(null)
  /** True while we're awaiting the patient's reply to the latest message. */
  const patientThinking = ref(false)
  /** The generated patient's profile + vitals; null until `session_started`. */
  const vitals = ref<PatientVitals | null>(null)

  let socket: Socket | null = null
  /** Id of the patient bubble currently being streamed into, if any. */
  let streamingId: string | null = null

  const isConnected = computed(() => phase.value === 'active')
  const isGenerating = computed(
    () => phase.value === 'connecting' || phase.value === 'generating',
  )
  /** The simulated patient is "alive" once generated — drives the heartbeat. */
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

    // Patient generation finished — chat is live. Capture the vitals and show
    // the patient's opening line as the first message.
    s.on('session_started', (payload: SessionStartedPayload) => {
      phase.value = 'active'
      if (payload?.vitals) vitals.value = payload.vitals
      pushMessage('system', 'Consultation started — the patient is ready.')
      if (payload?.message) pushMessage('patient', payload.message)
    })

    // Streamed reply tokens (backend may batch or stream these).
    s.on('chat:chunk', (payload: { chunk?: string }) => {
      patientThinking.value = false
      const target = streamingMessage()
      if (target) target.content += payload?.chunk ?? ''
    })

    // Reply complete — finalise the streaming bubble.
    s.on('chat:done', () => {
      patientThinking.value = false
      const target = streamingMessage()
      if (target) {
        target.pending = false
        // Backend streaming is still being wired up; show a gentle placeholder
        // rather than an empty bubble if no tokens arrived.
        if (!target.content) {
          target.content = '…'
        }
      }
      streamingId = null
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

    // Pre-create the patient bubble so streamed tokens have somewhere to land.
    const reply = pushMessage('patient', '')
    reply.pending = true
    streamingId = reply.id
    patientThinking.value = true
  }

  /** End the session: disconnecting tells the backend to wrap up + analyse. */
  function end(): void {
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
    vitals,
    isConnected,
    isGenerating,
    patientAlive,
    // actions
    start,
    sendMessage,
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
