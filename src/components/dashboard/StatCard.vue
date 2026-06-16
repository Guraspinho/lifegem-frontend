<script setup lang="ts">
import { computed } from 'vue'
import type { DashboardStat } from '@/types/dashboard.types'

const props = defineProps<{ stat: DashboardStat; loading?: boolean }>()

interface Accent {
  icon: string
  ring: string
  glow: string
}

const ACCENTS: Record<DashboardStat['icon'], Accent> = {
  pulse: {
    icon: 'text-indigo-600 dark:text-indigo-400',
    ring: 'text-indigo-500',
    glow: 'bg-indigo-400/20',
  },
  target: {
    icon: 'text-violet-600 dark:text-violet-400',
    ring: 'text-violet-500',
    glow: 'bg-violet-400/20',
  },
  shield: {
    icon: 'text-emerald-600 dark:text-emerald-400',
    ring: 'text-emerald-500',
    glow: 'bg-emerald-400/20',
  },
  check: {
    icon: 'text-cyan-600 dark:text-cyan-400',
    ring: 'text-cyan-500',
    glow: 'bg-cyan-400/20',
  },
}

const RADIUS = 26
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const accent = computed(() => ACCENTS[props.stat.icon])
const isPercent = computed(() => props.stat.unit === '%')
const hasValue = computed(() => props.stat.value !== null)

const pct = computed(() => {
  if (!isPercent.value || props.stat.value === null) return 0
  return Math.max(0, Math.min(100, props.stat.value))
})

const dashOffset = computed(() => CIRCUMFERENCE * (1 - pct.value / 100))

const valueLabel = computed(() => {
  if (!hasValue.value) return '—'
  if (isPercent.value) return `${Math.round(props.stat.value as number)}%`
  return String(props.stat.value)
})

const caption = computed(() => {
  if (!hasValue.value) return 'No sessions yet'
  if (!isPercent.value) return 'Lifetime total'
  const v = props.stat.value as number
  if (v >= 75) return 'Excellent'
  if (v >= 50) return 'On track'
  return 'Keep practicing'
})
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
  >
    <div v-if="loading" class="flex animate-pulse items-center gap-4">
      <div class="h-16 w-16 flex-none rounded-full bg-slate-100 dark:bg-slate-800" />
      <div class="flex-1 space-y-2">
        <div class="h-6 w-16 rounded bg-slate-200 dark:bg-slate-700" />
        <div class="h-3 w-28 rounded bg-slate-100 dark:bg-slate-800" />
        <div class="h-2.5 w-20 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>

    <template v-else>
      <div
        class="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        :class="accent.glow"
        aria-hidden="true"
      />

      <div class="relative flex items-center gap-4">
      <div class="relative h-16 w-16 flex-none">
        <svg class="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            :r="RADIUS"
            fill="none"
            stroke-width="5"
            class="text-slate-100 dark:text-slate-800"
            stroke="currentColor"
          />
          <circle
            v-if="isPercent"
            cx="32"
            cy="32"
            :r="RADIUS"
            fill="none"
            stroke-width="5"
            stroke-linecap="round"
            class="transition-all duration-700 ease-out"
            :class="accent.ring"
            stroke="currentColor"
            :stroke-dasharray="CIRCUMFERENCE"
            :stroke-dashoffset="dashOffset"
          />
        </svg>
        <span
          class="absolute inset-0 flex items-center justify-center"
          :class="accent.icon"
        >
          <svg
            class="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <template v-if="stat.icon === 'pulse'">
              <path d="M3 12h4l2-6 4 12 2-6h6" />
            </template>
            <template v-else-if="stat.icon === 'target'">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="12" cy="12" r="1" />
            </template>
            <template v-else-if="stat.icon === 'shield'">
              <path d="M12 3 5 6v5c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6l-7-3Z" />
              <path d="m9 12 2 2 4-4" />
            </template>
            <template v-else>
              <path d="M20 6 9 17l-5-5" />
            </template>
          </svg>
        </span>
      </div>

      <div class="min-w-0">
        <p
          class="text-2xl font-semibold tracking-tight tabular-nums"
          :class="hasValue ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-600'"
        >
          {{ valueLabel }}
        </p>
        <p class="mt-0.5 text-sm font-medium text-slate-600 dark:text-slate-300">
          {{ stat.label }}
        </p>
        <p class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
          {{ caption }}
        </p>
      </div>
      </div>
    </template>
  </div>
</template>
