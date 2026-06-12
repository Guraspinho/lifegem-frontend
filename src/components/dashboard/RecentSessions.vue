<script setup lang="ts">
/**
 * Recent simulation history. A compact list of completed sessions with the
 * specialty, the simulated patient condition, a colour-coded score and the
 * completion date. Score colour is derived from the value, not the specialty,
 * so performance reads at a glance.
 */
import type { RecentSession, SpecialtyAccent } from '@/types/dashboard.types'

defineProps<{ sessions: RecentSession[] }>()

const DOT: Record<SpecialtyAccent, string> = {
  red: 'bg-red-500',
  indigo: 'bg-indigo-500',
  cyan: 'bg-cyan-500',
}

/** Score → badge classes. Green strong, amber fair, rose weak. */
function scoreClass(score: number): string {
  if (score >= 85)
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
  if (score >= 70)
    return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
  return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
}
</script>

<template>
  <section
    class="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
  >
    <div class="flex items-center justify-between">
      <h2
        class="text-base font-semibold tracking-tight text-slate-900 dark:text-white"
      >
        Recent sessions
      </h2>
      <button
        type="button"
        class="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
      >
        View all
      </button>
    </div>

    <ul class="mt-4 flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
      <li
        v-for="session in sessions"
        :key="session.id"
        class="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"
      >
        <span
          class="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
          :class="DOT[session.accent]"
          aria-hidden="true"
        />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
            {{ session.condition }}
          </p>
          <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {{ session.specialty }} · {{ session.date }}
          </p>
        </div>
        <span
          class="shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold"
          :class="scoreClass(session.score)"
        >
          {{ session.score }}%
        </span>
      </li>
    </ul>
  </section>
</template>
