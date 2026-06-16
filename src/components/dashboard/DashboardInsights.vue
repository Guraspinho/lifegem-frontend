<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useUserSessions } from '@/composables/useUserSessions'
import ScoreTrendChart from '@/components/sessions/ScoreTrendChart.vue'

const { sessions, isLoading, isEmpty, fetchInitial } = useUserSessions(8)

onMounted(fetchInitial)

function shortDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const scored = computed(() =>
  [...sessions.value].filter((s) => s.score !== null).reverse(),
)

const trendPoints = computed(() =>
  scored.value.map((s) => ({
    label: shortDate(s.createdAt),
    value: s.score as number,
  })),
)

const average = computed(() => {
  const values = trendPoints.value.map((p) => p.value)
  if (!values.length) return null
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
})

const latest = computed(() => {
  const list = scored.value
  return list.length ? Math.round(list[list.length - 1]!.score as number) : null
})

const latestTone = computed(() => {
  const s = latest.value ?? 0
  if (s >= 75) return 'text-emerald-600 dark:text-emerald-400'
  if (s >= 50) return 'text-amber-600 dark:text-amber-400'
  return 'text-rose-600 dark:text-rose-400'
})
</script>

<template>
  <section
    class="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
  >
    <div class="flex items-center justify-between">
      <h2
        class="text-base font-semibold tracking-tight text-slate-900 dark:text-white"
      >
        Performance
      </h2>
      <RouterLink
        :to="{ name: 'sessions' }"
        class="flex items-center gap-0.5 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
      >
        All sessions
        <svg
          class="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </RouterLink>
    </div>

    <div v-if="isLoading" class="mt-6 flex flex-1 flex-col gap-3">
      <div class="h-8 w-24 rounded bg-slate-200 dark:bg-slate-700" />
      <div class="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800" />
    </div>

    <div
      v-else-if="isEmpty || !trendPoints.length"
      class="mt-4 flex flex-1 flex-col items-center justify-center text-center"
    >
      <span
        class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
      >
        <svg
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 3v18h18" />
          <path d="m7 14 3-3 3 3 5-5" />
        </svg>
      </span>
      <p class="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
        No scored sessions yet
      </p>
      <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Finish a simulation to start tracking your trend.
      </p>
    </div>

    <div v-else class="mt-4 flex flex-1 flex-col">
      <div class="flex items-end justify-between">
        <div>
          <p class="text-xs text-slate-500 dark:text-slate-400">Last session</p>
          <p
            class="text-3xl font-semibold tabular-nums tracking-tight"
            :class="latestTone"
          >
            {{ latest }}<span class="text-base">%</span>
          </p>
        </div>
        <div v-if="average !== null" class="text-right">
          <p class="text-xs text-slate-500 dark:text-slate-400">Average</p>
          <p
            class="text-lg font-semibold tabular-nums text-slate-700 dark:text-slate-300"
          >
            {{ average }}%
          </p>
        </div>
      </div>

      <div class="mt-4">
        <ScoreTrendChart :points="trendPoints" :average="average" />
      </div>
    </div>
  </section>
</template>
