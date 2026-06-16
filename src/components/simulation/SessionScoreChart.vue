<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  scores: number[]
  average?: number | null
}>()

const clamp = (n: number): number => Math.max(0, Math.min(100, n))

const bars = computed(() =>
  props.scores.map((raw, i) => {
    const value = clamp(raw)
    let bar = 'bg-rose-500'
    if (value >= 75) bar = 'bg-emerald-500'
    else if (value >= 50) bar = 'bg-amber-500'
    else if (value >= 25) bar = 'bg-orange-500'
    return { turn: i + 1, value, bar }
  }),
)

const averagePct = computed(() =>
  props.average === null || props.average === undefined
    ? null
    : clamp(props.average),
)
</script>

<template>
  <div>
    <div
      v-if="!bars.length"
      class="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500"
    >
      No scored turns in this session.
    </div>

    <div v-else>
      <div class="relative h-44">
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

        <div class="flex h-full items-end justify-center gap-3 sm:gap-4">
          <div
            v-for="b in bars"
            :key="b.turn"
            class="group flex h-full w-full max-w-[2.25rem] flex-col items-center justify-end"
          >
            <span
              class="mb-1 text-[10px] font-semibold tabular-nums text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-500"
            >
              {{ b.value }}%
            </span>
            <div
              class="w-full rounded-lg transition-all duration-500 ease-out group-hover:opacity-90"
              :class="b.bar"
              :style="{ height: `${Math.max(3, b.value)}%` }"
            />
          </div>
        </div>
      </div>

      <div class="mt-2 flex justify-center gap-3 sm:gap-4">
        <span
          v-for="b in bars"
          :key="b.turn"
          class="w-full max-w-[2.25rem] text-center text-[10px] tabular-nums text-slate-400 dark:text-slate-500"
        >
          {{ b.turn }}
        </span>
      </div>

      <p class="mt-1.5 text-center text-xs text-slate-400 dark:text-slate-500">
        Accuracy by message turn
      </p>
    </div>
  </div>
</template>
