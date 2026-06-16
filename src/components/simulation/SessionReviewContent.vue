<script setup lang="ts">
import { computed } from 'vue'
import SessionScoreChart from './SessionScoreChart.vue'
import type { FinalReview } from '@/types/chat.types'

const props = defineProps<{
  review: FinalReview
  score: number
  stepScores: number[]
  patientSurvived: boolean | null
  durationSeconds: number | null
  finalDiagnosis: string | null
}>()

const scorePct = computed(() => Math.round(props.score ?? 0))

const scoreTone = computed(() => {
  const s = scorePct.value
  if (s >= 75) return 'text-emerald-600 dark:text-emerald-400'
  if (s >= 50) return 'text-amber-600 dark:text-amber-400'
  if (s >= 25) return 'text-orange-600 dark:text-orange-400'
  return 'text-rose-600 dark:text-rose-400'
})

const durationLabel = computed(() => {
  if (props.durationSeconds === null) return '—'
  const total = Math.max(0, Math.round(props.durationSeconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})
</script>

<template>
  <div class="space-y-6">
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
          v-if="patientSurvived !== null"
          class="mt-1 text-sm font-semibold"
          :class="
            patientSurvived
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          "
        >
          {{ patientSurvived ? 'Survived' : 'Deceased' }}
        </p>
        <p v-else class="mt-1 text-sm text-slate-400 dark:text-slate-500">—</p>
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
      <h3 class="mb-1.5 text-sm font-semibold text-slate-900 dark:text-white">
        Overall performance
      </h3>
      <p class="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
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
      v-if="stepScores.length"
      class="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
    >
      <h3 class="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
        Performance over time
      </h3>
      <SessionScoreChart :scores="stepScores" :average="score" />
    </section>

    <section
      class="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-700 dark:bg-slate-800/40"
    >
      <h3 class="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
        Diagnosis
      </h3>
      <dl class="space-y-2.5 text-sm">
        <div class="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
          <dt class="w-40 flex-none text-slate-500 dark:text-slate-400">
            Actual condition
          </dt>
          <dd class="font-medium text-slate-800 dark:text-slate-200">
            {{ review.diagnosis.actualCondition || '—' }}
          </dd>
        </div>
        <div class="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
          <dt class="w-40 flex-none text-slate-500 dark:text-slate-400">
            Your diagnosis
          </dt>
          <dd
            class="font-medium text-slate-800 dark:text-slate-200"
            :class="{ 'italic text-slate-400 dark:text-slate-500': !review.diagnosis.traineeDiagnosis }"
          >
            {{ review.diagnosis.traineeDiagnosis || finalDiagnosis || 'Not submitted' }}
          </dd>
        </div>
        <div
          v-if="review.diagnosis.notes"
          class="flex flex-col gap-0.5 sm:flex-row sm:gap-3"
        >
          <dt class="w-40 flex-none text-slate-500 dark:text-slate-400">
            Notes
          </dt>
          <dd class="leading-relaxed text-slate-600 dark:text-slate-300">
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
          <path
            d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2Z"
          />
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
</template>
