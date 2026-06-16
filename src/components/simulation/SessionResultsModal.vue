<script setup lang="ts">
import { computed } from 'vue'
import SessionScoreChart from './SessionScoreChart.vue'
import type { SessionEndPayload } from '@/types/chat.types'

const props = defineProps<{
  open: boolean
  loading: boolean
  report: SessionEndPayload | null
  errorMessage?: string | null
  specialtyTitle: string
}>()

const emit = defineEmits<{ close: [] }>()

const review = computed(() => props.report?.review ?? null)
const scorePct = computed(() => Math.round(props.report?.score ?? 0))

const scoreTone = computed(() => {
  const s = scorePct.value
  if (s >= 75) return 'text-emerald-600 dark:text-emerald-400'
  if (s >= 50) return 'text-amber-600 dark:text-amber-400'
  if (s >= 25) return 'text-orange-600 dark:text-orange-400'
  return 'text-rose-600 dark:text-rose-400'
})

const durationLabel = computed(() => {
  const total = Math.max(0, Math.round(props.report?.durationSeconds ?? 0))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})
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

          <div class="flex-1 overflow-y-auto px-6 py-5">
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

            <div
              v-else-if="errorMessage && !review"
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

            <div v-else-if="review && report" class="space-y-6">
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
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

                <div
                  class="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40"
                >
                  <p
                    class="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500"
                  >
                    Diagnosis
                  </p>
                  <p
                    class="mt-1 text-sm font-semibold"
                    :class="
                      review.diagnosis.correct
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    "
                  >
                    {{ review.diagnosis.correct ? 'Correct' : 'Incorrect' }}
                  </p>
                </div>

                <div
                  class="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40"
                >
                  <p
                    class="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500"
                  >
                    Patient
                  </p>
                  <p
                    class="mt-1 text-sm font-semibold"
                    :class="
                      report.patientSurvived
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    "
                  >
                    {{ report.patientSurvived ? 'Survived' : 'Deceased' }}
                  </p>
                </div>

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

              <section
                class="rounded-2xl border border-slate-200 bg-indigo-50/40 p-5 dark:border-slate-700 dark:bg-indigo-500/5"
              >
                <h3
                  class="mb-1.5 text-sm font-semibold text-slate-900 dark:text-white"
                >
                  Overall performance
                </h3>
                <p
                  class="text-sm leading-relaxed text-slate-600 dark:text-slate-300"
                >
                  {{ review.overallPerformance }}
                </p>
                <p
                  v-if="review.scoreJustification"
                  class="mt-3 border-t border-slate-200/70 pt-3 text-xs leading-relaxed text-slate-500 dark:border-slate-700 dark:text-slate-400"
                >
                  {{ review.scoreJustification }}
                </p>
              </section>

              <section
                class="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
              >
                <h3
                  class="mb-4 text-sm font-semibold text-slate-900 dark:text-white"
                >
                  Performance over time
                </h3>
                <SessionScoreChart
                  :scores="report.stepScores"
                  :average="report.score"
                />
              </section>

              <section
                class="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-700 dark:bg-slate-800/40"
              >
                <h3
                  class="mb-3 text-sm font-semibold text-slate-900 dark:text-white"
                >
                  Diagnosis
                </h3>
                <dl class="space-y-2.5 text-sm">
                  <div class="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                    <dt
                      class="w-40 flex-none text-slate-500 dark:text-slate-400"
                    >
                      Actual condition
                    </dt>
                    <dd class="font-medium text-slate-800 dark:text-slate-200">
                      {{ review.diagnosis.actualCondition || '—' }}
                    </dd>
                  </div>
                  <div class="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                    <dt
                      class="w-40 flex-none text-slate-500 dark:text-slate-400"
                    >
                      Your diagnosis
                    </dt>
                    <dd
                      class="font-medium text-slate-800 dark:text-slate-200"
                      :class="{ 'italic text-slate-400 dark:text-slate-500': !review.diagnosis.traineeDiagnosis }"
                    >
                      {{ review.diagnosis.traineeDiagnosis || 'Not submitted' }}
                    </dd>
                  </div>
                  <div
                    v-if="review.diagnosis.notes"
                    class="flex flex-col gap-0.5 sm:flex-row sm:gap-3"
                  >
                    <dt
                      class="w-40 flex-none text-slate-500 dark:text-slate-400"
                    >
                      Notes
                    </dt>
                    <dd
                      class="leading-relaxed text-slate-600 dark:text-slate-300"
                    >
                      {{ review.diagnosis.notes }}
                    </dd>
                  </div>
                </dl>
              </section>

              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <section
                  class="rounded-2xl border border-emerald-200/70 bg-emerald-50/50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/5"
                >
                  <h3
                    class="mb-3 flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400"
                  >
                    <svg
                      class="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    What went well
                  </h3>
                  <ul class="space-y-2">
                    <li
                      v-for="(item, i) in review.whatWentWell"
                      :key="i"
                      class="flex gap-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
                    >
                      <span
                        class="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-emerald-500"
                      />
                      {{ item }}
                    </li>
                    <li
                      v-if="!review.whatWentWell.length"
                      class="text-sm italic text-slate-400 dark:text-slate-500"
                    >
                      Nothing noted.
                    </li>
                  </ul>
                </section>

                <section
                  class="rounded-2xl border border-amber-200/70 bg-amber-50/50 p-5 dark:border-amber-500/20 dark:bg-amber-500/5"
                >
                  <h3
                    class="mb-3 flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400"
                  >
                    <svg
                      class="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M12 20v-6M12 10V4" />
                      <path d="m9 7 3-3 3 3" />
                    </svg>
                    To improve
                  </h3>
                  <ul class="space-y-2">
                    <li
                      v-for="(item, i) in review.whatCouldBeImproved"
                      :key="i"
                      class="flex gap-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
                    >
                      <span
                        class="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-amber-500"
                      />
                      {{ item }}
                    </li>
                    <li
                      v-if="!review.whatCouldBeImproved.length"
                      class="text-sm italic text-slate-400 dark:text-slate-500"
                    >
                      Nothing noted.
                    </li>
                  </ul>
                </section>
              </div>

              <section
                v-if="review.keyLearningPoints.length"
                class="rounded-2xl border border-indigo-200/70 bg-indigo-50/50 p-5 dark:border-indigo-500/20 dark:bg-indigo-500/5"
              >
                <h3
                  class="mb-3 flex items-center gap-1.5 text-sm font-semibold text-indigo-700 dark:text-indigo-400"
                >
                  <svg
                    class="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M9 18h6M10 22h4" />
                    <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2Z" />
                  </svg>
                  Key learning points
                </h3>
                <ul class="space-y-2">
                  <li
                    v-for="(item, i) in review.keyLearningPoints"
                    :key="i"
                    class="flex gap-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
                  >
                    <span
                      class="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-indigo-100 text-[11px] font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300"
                    >
                      {{ i + 1 }}
                    </span>
                    {{ item }}
                  </li>
                </ul>
              </section>
            </div>
          </div>

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
