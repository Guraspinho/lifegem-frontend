<script setup lang="ts">
import { computed } from 'vue'

interface TrendPoint {
  label: string
  value: number
}

const props = defineProps<{
  points: TrendPoint[]
  average?: number | null
}>()

const clamp = (n: number): number => Math.max(0, Math.min(100, n))

const bars = computed(() =>
  props.points.map((p, i) => {
    const value = clamp(p.value)
    let bar = 'bg-rose-500'
    if (value >= 75) bar = 'bg-emerald-500'
    else if (value >= 50) bar = 'bg-amber-500'
    else if (value >= 25) bar = 'bg-orange-500'
    return { ...p, value, bar, key: `${i}-${p.label}` }
  }),
)

const averagePct = computed(() =>
  props.average === null || props.average === undefined
    ? null
    : clamp(props.average),
)
</script>

<template>
  <div
    v-if="!bars.length"
    class="flex h-52 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500"
  >
    No scored sessions yet.
  </div>

  <div v-else>
    <div class="relative h-52">
      <div
        class="pointer-events-none absolute inset-0 flex flex-col justify-between"
        aria-hidden="true"
      >
        <div
          v-for="line in 4"
          :key="line"
          class="h-px w-full bg-slate-100 dark:bg-slate-800"
        />
      </div>

      <div
        v-if="averagePct !== null"
        class="pointer-events-none absolute inset-x-0 z-10"
        :style="{ bottom: `${averagePct}%` }"
      >
        <div
          class="h-px w-full border-t border-dashed border-indigo-400/70 dark:border-indigo-400/50"
        />
        <span
          class="absolute right-0 -top-2.5 rounded bg-indigo-50 px-1 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
        >
          avg {{ Math.round(averagePct) }}%
        </span>
      </div>

      <div class="relative flex h-full items-end gap-2 sm:gap-3">
        <div
          v-for="b in bars"
          :key="b.key"
          class="group flex h-full w-full max-w-[3rem] flex-col items-center justify-end"
        >
          <div
            class="pointer-events-none absolute bottom-full z-20 mb-1 hidden -translate-y-0 flex-col items-center rounded-lg bg-slate-900 px-2 py-1 text-center shadow-lg group-hover:flex dark:bg-slate-700"
          >
            <span class="text-xs font-semibold text-white tabular-nums">
              {{ b.value }}%
            </span>
            <span class="text-[10px] text-slate-300">{{ b.label }}</span>
          </div>
          <div
            class="w-full rounded-t-lg transition-all duration-500 ease-out group-hover:opacity-90"
            :class="b.bar"
            :style="{ height: `${Math.max(3, b.value)}%` }"
          />
        </div>
      </div>
    </div>

    <div class="mt-2 flex gap-2 sm:gap-3">
      <span
        v-for="b in bars"
        :key="b.key"
        class="w-full max-w-[3rem] truncate text-center text-[10px] text-slate-400 dark:text-slate-500"
      >
        {{ b.label }}
      </span>
    </div>
  </div>
</template>
