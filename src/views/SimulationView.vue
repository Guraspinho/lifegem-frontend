<script setup lang="ts">
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

const showEndWarning = ref(false)
const showResults = ref(false)

onMounted(() => {
  const backendSpecialty = specialty.value
    ? sessionSpecialtyById[specialty.value.id]
    : undefined

  if (!specialty.value || !backendSpecialty) {
    void router.replace({ name: 'home' })
    return
  }
  start(backendSpecialty)
})

function handleEnd(): void {
  if (phase.value === 'active' && !hasDiagnosis.value) {
    showEndWarning.value = true
    return
  }
  beginEnd()
}

function beginEnd(): void {
  showEndWarning.value = false
  if (requestEnd()) {
    showResults.value = true
  } else {
    leaveSession()
  }
}

function leaveSession(): void {
  showResults.value = false
  end()
  void router.push({ name: 'home' })
}

function handleRetry(): void {
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
      <div class="min-h-0 lg:col-span-2">
        <ChatPanel
          :messages="messages"
          :active="phase === 'active'"
          :thinking="patientThinking"
          @send="sendMessage"
        />
      </div>

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

    <EndSessionDialog
      :open="showEndWarning"
      @confirm="beginEnd"
      @cancel="showEndWarning = false"
    />

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
