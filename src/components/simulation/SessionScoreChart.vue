<script setup lang="ts">
/**
 * Per-message accuracy bar chart for the session report. Each bar is one doctor
 * turn; height maps the 0–100 accuracy score and the colour grades by band.
 * A dashed line marks the final (mean) score for quick comparison.
 */
import { computed } from 'vue'

const props = defineProps<{
  /** Accuracy score per doctor turn, in order (0–100). */
  scores: number[]
  /** Optional mean/final score to draw as a reference line. */
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
      <!-- Plot area (bars only, so the average line maps cleanly) -->
      <div class="relative h-40">
        <!-- Average reference line -->
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

        <div class="flex h-full items-end gap-1.5">
          <div
            v-for="b in bars"
            :key="b.turn"
            class="group relative flex h-full flex-1 items-end"
          >
            <!-- Value tooltip on hover -->
            <span
              class="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 shadow transition-opacity group-hover:opacity-100 dark:bg-slate-700"
            >
              {{ b.value }}%
            </span>
            <div
              class="w-full rounded-t-md transition-all duration-500 ease-out hover:opacity-90"
              :class="b.bar"
              :style="{ height: `${Math.max(2, b.value)}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Turn labels -->
      <div class="mt-1.5 flex gap-1.5">
        <span
          v-for="b in bars"
          :key="b.turn"
          class="flex-1 text-center text-[10px] tabular-nums text-slate-400 dark:text-slate-500"
        >
          {{ b.turn }}
        </span>
      </div>

      <p class="mt-1 text-center text-xs text-slate-400 dark:text-slate-500">
        Accuracy by message turn
      </p>
    </div>
  </div>
</template>
