<script setup lang="ts">
/**
 * End-of-session analytics window. Opens when the trainee ends the session and
 * walks through three states: a loading spinner while the server runs its
 * analysis, a timeout/error fallback, and the full report — summary stats, a
 * per-message accuracy chart, the final diagnosis, and the expandable AI
 * analysis. Closing it tears the socket down and returns to the dashboard.
 */
import { computed, ref } from 'vue'
import SessionScoreChart from './SessionScoreChart.vue'
import type { SessionResult } from '@/types/chat.types'

const props = defineProps<{
  open: boolean
  loading: boolean
  result: SessionResult | null
  scores: number[]
  /** Set when the analysis timed out / failed. */
  errorMessage?: string | null
  specialtyTitle: string
}>()

const emit = defineEmits<{ close: [] }>()

const analysisExpanded = ref(false)

const scorePct = computed(() => Math.round(props.result?.score ?? 0))

/** Colour-grade the headline score by band. */
const scoreTone = computed(() => {
  const s = scorePct.value
  if (s >= 75) return 'text-emerald-600 dark:text-emerald-400'
  if (s >= 50) return 'text-amber-600 dark:text-amber-400'
  if (s >= 25) return 'text-orange-600 dark:text-orange-400'
  return 'text-rose-600 dark:text-rose-400'
})

const durationLabel = computed(() => {
  const total = Math.max(0, Math.round(props.result?.duration_seconds ?? 0))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

/** Whether the analysis text is long enough to warrant the expand toggle. */
const analysisIsLong = computed(
  () => (props.result?.systemAnalysis?.length ?? 0) > 360,
)
</script>

<template>
  <Teleport to="body">
    <Transition name="results">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="results-title"
      >
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

        <div
          class="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between gap-3 border-b border-slate-200/80 px-6 py-4 dark:border-slate-800"
          >
            <div class="flex items-center gap-3">
              <span
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm shadow-indigo-500/30"
              >
                <svg
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.9"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <path d="M7 15l3-4 3 2 4-6" />
                </svg>
              </span>
              <div class="leading-tight">
                <h2
                  id="results-title"
                  class="text-base font-semibold tracking-tight text-slate-900 dark:text-white"
                >
                  Session analysis
                </h2>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  {{ specialtyTitle }} simulation
                </p>
              </div>
            </div>

            <button
              v-if="!loading"
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              aria-label="Close"
              @click="emit('close')"
            >
              <svg
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-6 py-5">
            <!-- Loading -->
            <div
              v-if="loading"
              class="flex flex-col items-center justify-center py-16 text-center"
            >
              <div class="relative flex h-16 w-16 items-center justify-center">
                <span
                  class="absolute inset-0 animate-ping rounded-full bg-indigo-400/30"
                />
                <svg
                  class="relative h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="3"
                  />
                  <path
                    class="opacity-90"
                    fill="currentColor"
                    d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4Z"
                  />
                </svg>
              </div>
              <p
                class="mt-5 text-sm font-semibold text-slate-800 dark:text-slate-100"
              >
                Analyzing your consultation…
              </p>
              <p class="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                Reviewing your questions, the patient's responses and your final
                diagnosis. This can take a few moments.
              </p>
            </div>

            <!-- Error / timeout -->
            <div
              v-else-if="errorMessage && !result"
              class="flex flex-col items-center justify-center py-16 text-center"
            >
              <span
                class="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
              >
                <svg
                  class="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 9v4M12 17h.01" />
                  <path
                    d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
                  />
                </svg>
              </span>
              <p
                class="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-100"
              >
                Analysis unavailable
              </p>
              <p class="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                {{ errorMessage }}
              </p>
            </div>

            <!-- Report -->
            <div v-else-if="result" class="space-y-6">
              <!-- Summary stats -->
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <!-- Score -->
                <div
                  class="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40"
                >
                  <p
                    class="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500"
                  >
                    Final score
                  </p>
                  <p
                    class="mt-1 text-2xl font-semibold tabular-nums tracking-tight"
                    :class="scoreTone"
                  >
                    {{ scorePct }}<span class="text-base">%</span>
                  </p>
                </div>

                <!-- Diagnosis correctness -->
                <div
                  class="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40"
                >
                  <p
                    class="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500"
                  >
                    Diagnosis
                  </p>
                  <p
                    class="mt-1 flex items-center gap-1.5 text-sm font-semibold"
                    :class="
                      result.correct_diagnosis
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    "
                  >
                    {{ result.correct_diagnosis ? 'Correct' : 'Incorrect' }}
                  </p>
                </div>

                <!-- Patient outcome -->
                <div
                  class="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40"
                >
                  <p
                    class="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500"
                  >
                    Patient
                  </p>
                  <p
                    class="mt-1 flex items-center gap-1.5 text-sm font-semibold"
                    :class="
                      result.patient_survived
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    "
                  >
                    {{ result.patient_survived ? 'Survived' : 'Deceased' }}
                  </p>
                </div>

                <!-- Duration -->
                <div
                  class="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40"
                >
                  <p
                    class="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500"
                  >
                    Duration
                  </p>
                  <p
                    class="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white"
                  >
                    {{ durationLabel }}
                  </p>
                </div>
              </div>

              <!-- Accuracy chart -->
              <section
                class="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
              >
                <h3
                  class="mb-4 text-sm font-semibold text-slate-900 dark:text-white"
                >
                  Performance over time
                </h3>
                <SessionScoreChart :scores="scores" :average="result.score" />
              </section>

              <!-- Final diagnosis -->
              <section>
                <h3
                  class="mb-2 text-sm font-semibold text-slate-900 dark:text-white"
                >
                  Your final diagnosis
                </h3>
                <p
                  class="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300"
                  :class="{ 'italic text-slate-400 dark:text-slate-500': !result.final_diagnosis }"
                >
                  {{ result.final_diagnosis || 'No final diagnosis was submitted.' }}
                </p>
              </section>

              <!-- System analysis (expandable) -->
              <section>
                <h3
                  class="mb-2 text-sm font-semibold text-slate-900 dark:text-white"
                >
                  Clinical analysis
                </h3>
                <div
                  class="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40"
                >
                  <div class="relative">
                    <p
                      class="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300"
                      :class="
                        analysisIsLong && !analysisExpanded
                          ? 'max-h-32 overflow-hidden'
                          : ''
                      "
                    >
                      {{ result.systemAnalysis || 'No analysis was generated for this session.' }}
                    </p>
                    <!-- Fade overlay when collapsed -->
                    <div
                      v-if="analysisIsLong && !analysisExpanded"
                      class="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-50/90 to-transparent dark:from-slate-800/70"
                    />
                  </div>

                  <button
                    v-if="analysisIsLong"
                    type="button"
                    class="mt-2 flex items-center gap-1 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
                    @click="analysisExpanded = !analysisExpanded"
                  >
                    {{ analysisExpanded ? 'Show less' : 'Read full analysis' }}
                    <svg
                      class="h-3.5 w-3.5 transition-transform"
                      :class="{ 'rotate-180': analysisExpanded }"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>
              </section>
            </div>
          </div>

          <!-- Footer -->
          <div
            v-if="!loading"
            class="flex justify-end border-t border-slate-200/80 px-6 py-4 dark:border-slate-800"
          >
            <button
              type="button"
              class="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
              @click="emit('close')"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.results-enter-active,
.results-leave-active {
  transition: opacity 0.2s ease;
}
.results-enter-from,
.results-leave-to {
  opacity: 0;
}
</style>
