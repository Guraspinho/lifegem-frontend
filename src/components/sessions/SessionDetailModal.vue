<script setup lang="ts">
import { computed } from 'vue'
import SessionReviewContent from '@/components/simulation/SessionReviewContent.vue'
import { formatSessionDate, specialtyLabel } from '@/utils/sessions'
import type { UserSessionDetail } from '@/types/user.types'

const props = defineProps<{
  open: boolean
  loading: boolean
  error?: string | null
  detail: UserSessionDetail | null
}>()

const emit = defineEmits<{ close: [] }>()

const review = computed(() => props.detail?.systemAnalysis ?? null)

const stepScores = computed(() =>
  (props.detail?.history ?? [])
    .filter((h) => h.userMessage !== null)
    .map((h) => h.vitals.answerAccuracy),
)

const title = computed(() => {
  const d = props.detail
  if (!d) return 'Session review'
  return d.condition || d.patient_name || `${specialtyLabel(d.specialty)} case`
})

const subtitle = computed(() => {
  const d = props.detail
  if (!d) return ''
  return `${specialtyLabel(d.specialty)} · ${formatSessionDate(d.createdAt)}`
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
        aria-labelledby="session-detail-title"
      >
        <div
          class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          @click="emit('close')"
        />

        <div
          class="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          <div
            class="flex items-center justify-between gap-3 border-b border-slate-200/80 px-6 py-4 dark:border-slate-800"
          >
            <div class="flex min-w-0 items-center gap-3">
              <span
                class="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm shadow-indigo-500/30"
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
              <div class="min-w-0 leading-tight">
                <h2
                  id="session-detail-title"
                  class="truncate text-base font-semibold tracking-tight text-slate-900 dark:text-white"
                >
                  {{ title }}
                </h2>
                <p class="truncate text-xs text-slate-500 dark:text-slate-400">
                  {{ subtitle }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="flex h-9 w-9 flex-none items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
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
              <svg
                class="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400"
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
              <p
                class="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-100"
              >
                Loading session…
              </p>
            </div>

            <div
              v-else-if="error"
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
                Couldn't load this session
              </p>
              <p class="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                {{ error }}
              </p>
            </div>

            <div
              v-else-if="detail && !review"
              class="flex flex-col items-center justify-center py-16 text-center"
            >
              <span
                class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
              >
                <svg
                  class="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                  <path d="M14 2v6h6M9 15h6M9 11h2" />
                </svg>
              </span>
              <p
                class="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-100"
              >
                No analysis for this session
              </p>
              <p class="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                This session wasn't completed, so there's no AI review to show.
              </p>
            </div>

            <SessionReviewContent
              v-else-if="detail && review"
              :review="review"
              :score="detail.score ?? 0"
              :step-scores="stepScores"
              :patient-survived="detail.patient_survived"
              :duration-seconds="detail.duration_seconds"
              :final-diagnosis="detail.final_diagnosis"
            />
          </div>

          <div
            class="flex justify-end border-t border-slate-200/80 px-6 py-4 dark:border-slate-800"
          >
            <button
              type="button"
              class="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
              @click="emit('close')"
            >
              Close
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
