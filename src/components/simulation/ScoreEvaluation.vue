<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    score: number | null
    delta?: number | null
    history?: number[]
    feedback?: string | null
  }>(),
  { delta: null, history: () => [], feedback: null },
)

const hasScore = computed(() => props.score !== null)
const clamped = computed(() => Math.max(0, Math.min(100, props.score ?? 0)))

const tone = computed(() => {
  const s = clamped.value
  if (s >= 75) return { text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500' }
  if (s >= 50) return { text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500' }
  if (s >= 25) return { text: 'text-orange-600 dark:text-orange-400', bar: 'bg-orange-500' }
  return { text: 'text-rose-600 dark:text-rose-400', bar: 'bg-rose-500' }
})

const deltaSign = computed(() => {
  if (props.delta === null || props.delta === 0) return 'flat'
  return props.delta > 0 ? 'up' : 'down'
})

const sparkPoints = computed(() => {
  const h = props.history ?? []
  if (h.length < 2) return ''
  const w = 100
  const ht = 28
  const step = w / (h.length - 1)
  return h
    .map((v, i) => {
      const x = i * step
      const y = ht - (Math.max(0, Math.min(100, v)) / 100) * ht
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})
</script>

<template>
  <div
    class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/60"
  >
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-1.5">
        <svg
          class="h-4 w-4 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 3v18h18" />
          <path d="m7 14 3-3 3 3 5-5" />
        </svg>
        <p
          class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Diagnostic accuracy
        </p>
      </div>

      <span
        v-if="deltaSign !== 'flat'"
        class="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums"
        :class="
          deltaSign === 'up'
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
            : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
        "
      >
        {{ deltaSign === 'up' ? '▲' : '▼' }}{{ Math.abs(delta ?? 0) }}
      </span>
    </div>

    <div class="mt-2 flex items-end justify-between gap-3">
      <p
        class="text-3xl font-semibold tabular-nums leading-none tracking-tight transition-colors duration-500"
        :class="hasScore ? tone.text : 'text-slate-300 dark:text-slate-600'"
      >
        {{ hasScore ? clamped : '––' }}<span class="text-base">%</span>
      </p>

      <svg
        v-if="sparkPoints"
        class="h-7 w-24 flex-none"
        viewBox="0 0 100 28"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <polyline
          :points="sparkPoints"
          class="transition-colors duration-500"
          :class="tone.text"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <div
      class="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"
    >
      <div
        class="h-full rounded-full transition-[width] duration-700 ease-out"
        :class="tone.bar"
        :style="{ width: `${hasScore ? clamped : 0}%` }"
      />
    </div>

    <p
      v-if="feedback"
      class="mt-3 text-xs italic leading-relaxed text-slate-500 dark:text-slate-400"
    >
      “{{ feedback }}”
    </p>
  </div>
</template>
