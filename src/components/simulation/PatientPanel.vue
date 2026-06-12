<script setup lang="ts">
/**
 * Right-hand patient panel. Mirrors the session lifecycle:
 *   generating → animated "generating patient" loader
 *   active     → patient profile + live vitals from `session_started`
 *   ended      → session-ended summary
 *   error      → failure message with a retry hint
 *
 * The patient's `condition` (the diagnosis target) and evaluation fields are
 * intentionally not shown here — the trainee has to reach the diagnosis.
 */
import { computed } from 'vue'
import type { PatientVitals, SessionPhase } from '@/types/chat.types'
import type { SpecialtyAccent } from '@/types/dashboard.types'

const props = defineProps<{
  phase: SessionPhase
  specialtyTitle: string
  accent: SpecialtyAccent
  vitals?: PatientVitals | null
  error?: string | null
}>()

defineEmits<{ retry: []; exit: [] }>()

/** The four live vitals shown in the grid, derived from the patient data. */
const vitalCards = computed(() => {
  const v = props.vitals
  return [
    { label: 'Heart rate', value: v ? String(v.heartRate) : '––', unit: 'bpm' },
    { label: 'Blood pressure', value: v?.bloodPressure ?? '––', unit: 'mmHg' },
    { label: 'SpO₂', value: v ? String(v.spO2) : '––', unit: '%' },
    { label: 'Pain level', value: v ? String(v.painLevel) : '––', unit: '/10' },
  ]
})

/** "42 · Male" style subtitle under the patient name. */
const demographics = computed(() => {
  const v = props.vitals
  if (!v) return ''
  return [v.patientAge ? `${v.patientAge} yrs` : null, v.patientGender]
    .filter(Boolean)
    .join(' · ')
})

/** Colour the status dot by how stable the patient reads. */
const statusTone = computed(() => {
  const s = (props.vitals?.patientStatus ?? '').toLowerCase()
  if (/(critical|unstable|severe)/.test(s))
    return 'text-rose-600 dark:text-rose-400'
  if (/(guarded|fair|moderate)/.test(s))
    return 'text-amber-600 dark:text-amber-400'
  return 'text-emerald-600 dark:text-emerald-400'
})

const statusDot = computed(() => {
  const s = (props.vitals?.patientStatus ?? '').toLowerCase()
  if (/(critical|unstable|severe)/.test(s)) return 'bg-rose-500'
  if (/(guarded|fair|moderate)/.test(s)) return 'bg-amber-500'
  return 'bg-emerald-500'
})
</script>

<template>
  <aside
    class="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60"
  >
    <!-- Generating loader -->
    <div
      v-if="phase === 'connecting' || phase === 'generating'"
      class="flex flex-1 flex-col items-center justify-center text-center"
    >
      <div class="relative flex h-20 w-20 items-center justify-center">
        <span
          class="absolute inset-0 animate-ping rounded-full bg-indigo-400/30"
        />
        <span
          class="absolute inset-2 animate-pulse rounded-full bg-indigo-400/20"
        />
        <svg
          class="relative h-9 w-9 animate-spin text-indigo-600 dark:text-indigo-400"
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
      </div>
      <p class="mt-5 text-sm font-semibold text-slate-800 dark:text-slate-100">
        {{ phase === 'connecting' ? 'Connecting…' : 'Generating patient…' }}
      </p>
      <p class="mt-1 max-w-[15rem] text-xs text-slate-500 dark:text-slate-400">
        Preparing a {{ specialtyTitle.toLowerCase() }} case. This usually takes a
        few seconds.
      </p>
    </div>

    <!-- Error -->
    <div
      v-else-if="phase === 'error'"
      class="flex flex-1 flex-col items-center justify-center text-center"
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
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path
            d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
          />
        </svg>
      </span>
      <p class="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
        Session failed
      </p>
      <p class="mt-1 max-w-[16rem] text-xs text-slate-500 dark:text-slate-400">
        {{ error ?? 'The connection to the simulation server was lost.' }}
      </p>
      <button
        type="button"
        class="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        @click="$emit('retry')"
      >
        Try again
      </button>
    </div>

    <!-- Ended -->
    <div
      v-else-if="phase === 'ended'"
      class="flex flex-1 flex-col items-center justify-center text-center"
    >
      <span
        class="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
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
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <p class="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
        Session ended
      </p>
      <p class="mt-1 max-w-[16rem] text-xs text-slate-500 dark:text-slate-400">
        Your consultation has been recorded. Analysis will appear on your
        dashboard.
      </p>
      <button
        type="button"
        class="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        @click="$emit('exit')"
      >
        Back to dashboard
      </button>
    </div>

    <!-- Active patient card -->
    <div v-else class="flex flex-1 flex-col overflow-y-auto">
      <div class="flex items-center gap-3">
        <span
          class="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-sm"
        >
          <svg
            class="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </span>
        <div class="min-w-0 leading-tight">
          <p class="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {{ vitals?.patientName || 'Patient' }}
          </p>
          <p
            v-if="demographics"
            class="truncate text-xs text-slate-500 dark:text-slate-400"
          >
            {{ demographics }}
          </p>
        </div>
      </div>

      <!-- Status -->
      <p
        v-if="vitals?.patientStatus"
        class="mt-3 flex items-center gap-1.5 text-xs font-medium"
        :class="statusTone"
      >
        <span
          class="inline-block h-1.5 w-1.5 animate-pulse rounded-full"
          :class="statusDot"
        />
        {{ vitals.patientStatus }}
      </p>

      <p
        class="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500"
      >
        Vitals
      </p>
      <div class="mt-2 grid grid-cols-2 gap-2.5">
        <div
          v-for="v in vitalCards"
          :key="v.label"
          class="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/60"
        >
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ v.label }}</p>
          <p class="mt-0.5 text-lg font-semibold tabular-nums text-slate-900 dark:text-white">
            {{ v.value }}
            <span class="text-xs font-normal text-slate-400">{{ v.unit }}</span>
          </p>
        </div>
      </div>

      <!-- Profile details -->
      <dl
        v-if="vitals"
        class="mt-3 space-y-2 rounded-xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-700 dark:bg-slate-800/60"
      >
        <div class="flex items-center justify-between gap-3">
          <dt class="text-slate-500 dark:text-slate-400">Weight</dt>
          <dd class="font-medium text-slate-800 dark:text-slate-200">
            {{ vitals.weight }} kg
          </dd>
        </div>
        <div class="flex items-start justify-between gap-3">
          <dt class="text-slate-500 dark:text-slate-400">Allergies</dt>
          <dd class="text-right font-medium text-slate-800 dark:text-slate-200">
            {{ vitals.knownAllergies || 'None known' }}
          </dd>
        </div>
      </dl>
    </div>
  </aside>
</template>
