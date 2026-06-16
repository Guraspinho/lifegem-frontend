<script setup lang="ts">
/**
 * Live simulation view (`/simulation/:specialty`).
 *
 * On mount it opens the Socket.IO session for the chosen specialty: connect →
 * `start_session` → wait for `session:start` (loader) → live chat. The chat
 * sits on the left, the patient monitor/vitals on the right, and the animated
 * heartbeat lives in the header's top-right corner.
 *
 * The specialty is resolved from the dashboard data by route param so we can
 * show its title/accent; unknown specialties bounce back to the dashboard.
 */
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SimulationHeader from '@/components/simulation/SimulationHeader.vue'
import ChatPanel from '@/components/simulation/ChatPanel.vue'
import PatientPanel from '@/components/simulation/PatientPanel.vue'
import FinalDiagnosisPanel from '@/components/simulation/FinalDiagnosisPanel.vue'
import EndSessionDialog from '@/components/simulation/EndSessionDialog.vue'
import SessionResultsModal from '@/components/simulation/SessionResultsModal.vue'
import { useChatSession } from '@/composables/useChatSession'
import { specialties } from '@/data/dashboard'
import { sessionSpecialtyById } from '@/data/simulation'

const route = useRoute()
const router = useRouter()

const specialtyId = computed(() => String(route.params.specialty ?? ''))
const specialty = computed(() =>
  specialties.find((s) => s.id === specialtyId.value),
)

const {
  phase,
  messages,
  error,
  patientThinking,
  patientAlive,
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
  start,
  sendMessage,
  submitDiagnosis,
  requestEnd,
  end,
} = useChatSession()

/** Shown when the trainee ends a live session without a saved diagnosis. */
const showEndWarning = ref(false)
/** Shown once the end is requested: loading → analysis report. */
const showResults = ref(false)

onMounted(() => {
  const backendSpecialty = specialty.value
    ? sessionSpecialtyById[specialty.value.id]
    : undefined

  // Guard against deep-links to an unknown / unmapped specialty.
  if (!specialty.value || !backendSpecialty) {
    void router.replace({ name: 'home' })
    return
  }
  start(backendSpecialty)
})

function handleEnd(): void {
  // Warn before ending a live session with no diagnosis on record. Other
  // phases (ended/error) skip the warning; there's nothing left to record.
  if (phase.value === 'active' && !hasDiagnosis.value) {
    showEndWarning.value = true
    return
  }
  beginEnd()
}

/**
 * Request the server analysis and open the results window. If there's no live
 * session to analyse (e.g. an error state), just leave straight away.
 */
function beginEnd(): void {
  showEndWarning.value = false
  if (requestEnd()) {
    showResults.value = true
  } else {
    leaveSession()
  }
}

/** Tear the session down and return to the dashboard. */
function leaveSession(): void {
  showResults.value = false
  end()
  void router.push({ name: 'home' })
}

function handleRetry(): void {
  // Simplest reliable reset: re-enter the route to rebuild the session.
  void router.go(0)
}
</script>

<template>
  <div
    v-if="specialty"
    class="flex h-screen flex-col bg-slate-100 dark:bg-slate-950"
  >
    <SimulationHeader
      :specialty-title="specialty.title"
      :accent="specialty.accent"
      :patient-alive="patientAlive"
      :bpm="patient?.heartRate"
      @end="handleEnd"
    />

    <main
      class="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-5 overflow-hidden px-4 py-5 sm:px-6 lg:grid-cols-3 lg:px-8"
    >
      <!-- Chat: left, takes the bulk of the width -->
      <div class="min-h-0 lg:col-span-2">
        <ChatPanel
          :messages="messages"
          :active="phase === 'active'"
          :thinking="patientThinking"
          @send="sendMessage"
        />
      </div>

      <!-- Right column: patient monitor + editable final diagnosis -->
      <div class="flex min-h-0 flex-col gap-5 lg:col-span-1">
        <div class="min-h-0 flex-1">
          <PatientPanel
            :phase="phase"
            :specialty-title="specialty.title"
            :accent="specialty.accent"
            :patient="patient"
            :score="score"
            :score-delta="scoreDelta"
            :score-history="scoreHistory"
            :feedback="feedback"
            :error="error"
            @retry="handleRetry"
            @exit="handleEnd"
          />
        </div>

        <FinalDiagnosisPanel
          :submitted="finalDiagnosis"
          :disabled="phase !== 'active'"
          @submit="submitDiagnosis"
        />
      </div>
    </main>

    <!-- Warn before ending a live session with no diagnosis on record. -->
    <EndSessionDialog
      :open="showEndWarning"
      @confirm="beginEnd"
      @cancel="showEndWarning = false"
    />

    <!-- End-of-session analytics: loads, then shows the full report. -->
    <SessionResultsModal
      :open="showResults"
      :loading="analyzing"
      :report="sessionReport"
      :error-message="analysisError"
      :specialty-title="specialty.title"
      @close="leaveSession"
    />
  </div>
</template>
