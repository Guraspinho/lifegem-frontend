<script setup lang="ts">
/**
 * Sticky header for the live simulation. Carries the LifeGem brand + the active
 * specialty on the left, the animated patient heartbeat monitor on the right,
 * and an "End session" action that tears down the socket.
 */
import PatientHeartbeat from './PatientHeartbeat.vue'
import type { SpecialtyAccent } from '@/types/dashboard.types'

defineProps<{
  specialtyTitle: string
  accent: SpecialtyAccent
  /** Animate the monitor once the patient is generated. */
  patientAlive: boolean
  bpm?: number
}>()

defineEmits<{ end: [] }>()

const ACCENT_DOT: Record<SpecialtyAccent, string> = {
  red: 'bg-red-500',
  indigo: 'bg-indigo-500',
  cyan: 'bg-cyan-500',
}
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div
      class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
    >
      <!-- Brand + specialty -->
      <div class="flex items-center gap-3">
        <RouterLink
          :to="{ name: 'home' }"
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-sm shadow-indigo-500/30 transition-transform hover:scale-105"
          aria-label="Back to dashboard"
        >
          <svg
            class="h-5 w-5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 12h3.5l2-6 3.5 12 2.5-7 1.5 1H21" />
          </svg>
        </RouterLink>
        <div class="leading-tight">
          <p
            class="text-base font-semibold tracking-tight text-slate-900 dark:text-white"
          >
            LifeGem
          </p>
          <p
            class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
          >
            <span
              class="inline-block h-1.5 w-1.5 rounded-full"
              :class="ACCENT_DOT[accent]"
            />
            {{ specialtyTitle }} simulation
          </p>
        </div>
      </div>

      <!-- Patient monitor + end session -->
      <div class="flex items-center gap-2 sm:gap-3">
        <PatientHeartbeat :alive="patientAlive" :bpm="bpm" />

        <button
          type="button"
          class="flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600 shadow-sm transition-colors hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:border-rose-500/30 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:focus-visible:ring-offset-slate-900"
          @click="$emit('end')"
        >
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="5" y="5" width="14" height="14" rx="2" />
          </svg>
          <span class="hidden sm:inline">End session</span>
        </button>
      </div>
    </div>
  </header>
</template>
