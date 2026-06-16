<script setup lang="ts">
/**
 * Interactive specialty card, the primary call-to-action on the dashboard.
 * Lightly glassmorphic, with a coloured accent driven by `specialty.accent`,
 * a hover lift, a difficulty badge, an estimated duration and a Start button.
 *
 * Accent classes are written out in full (no string interpolation) so Tailwind's
 * JIT compiler can see every utility at build time.
 */
import { computed } from 'vue'
import type { Specialty, SpecialtyAccent } from '@/types/dashboard.types'

const props = defineProps<{ specialty: Specialty }>()
defineEmits<{ start: [id: string] }>()

interface AccentStyle {
  iconWrap: string
  glow: string
  topBar: string
  button: string
  topic: string
  ring: string
}

const ACCENTS: Record<SpecialtyAccent, AccentStyle> = {
  red: {
    iconWrap:
      'bg-red-50 text-red-600 ring-red-100 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',
    glow: 'bg-red-400/20',
    topBar: 'from-red-400 to-rose-500',
    button:
      'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500 shadow-red-500/20',
    topic:
      'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300',
    ring: 'group-hover:ring-red-200 dark:group-hover:ring-red-500/30',
  },
  indigo: {
    iconWrap:
      'bg-indigo-50 text-indigo-600 ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20',
    glow: 'bg-indigo-400/20',
    topBar: 'from-indigo-400 to-violet-500',
    button:
      'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500 shadow-indigo-500/20',
    topic:
      'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300',
    ring: 'group-hover:ring-indigo-200 dark:group-hover:ring-indigo-500/30',
  },
  cyan: {
    iconWrap:
      'bg-cyan-50 text-cyan-600 ring-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-400 dark:ring-cyan-500/20',
    glow: 'bg-cyan-400/20',
    topBar: 'from-cyan-400 to-sky-500',
    button:
      'bg-cyan-600 hover:bg-cyan-700 focus-visible:ring-cyan-500 shadow-cyan-500/20',
    topic:
      'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300',
    ring: 'group-hover:ring-cyan-200 dark:group-hover:ring-cyan-500/30',
  },
}

const DIFFICULTY: Record<string, string> = {
  Beginner:
    'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  Intermediate:
    'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
  Advanced:
    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
}

const accent = computed(() => ACCENTS[props.specialty.accent])
const difficultyClass = computed(
  () => DIFFICULTY[props.specialty.difficulty] ?? DIFFICULTY.Intermediate,
)
</script>

<template>
  <article
    class="group relative flex min-h-[22rem] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm ring-1 ring-transparent backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:shadow-black/30"
    :class="accent.ring"
  >
    <!-- Accent top bar -->
    <div
      class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80"
      :class="accent.topBar"
      aria-hidden="true"
    />
    <!-- Soft corner glow on hover -->
    <div
      class="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
      :class="accent.glow"
      aria-hidden="true"
    />

    <div class="relative flex items-start justify-between gap-3">
      <!-- Specialty icon -->
      <span
        class="flex h-14 w-14 items-center justify-center rounded-2xl ring-1 transition-transform duration-300 group-hover:scale-105"
        :class="accent.iconWrap"
      >
        <!-- Traumatology: bone -->
        <svg
          v-if="specialty.icon === 'trauma'"
          class="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M17 10c.7-.7.7-1.3.7-2a2.5 2.5 0 0 0-4.3-1.7L7.3 12.4A2.5 2.5 0 0 0 6.3 14c-.7 0-1.3 0-2 .7A2.5 2.5 0 1 0 8 18.3l6-6"
          />
          <path d="m14 7 3 3" />
          <path d="m7 14 3 3" />
        </svg>
        <!-- Cardiology: heart pulse -->
        <svg
          v-else-if="specialty.icon === 'cardiology'"
          class="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M3.5 12.5h3l1.5-3 2.5 6 1.8-4 1.2 2h3.5a5 5 0 0 0-7.5-6.3A5 5 0 0 0 3.5 12.5Z"
          />
          <path d="M5 14.5 11 21l6-6.5" />
        </svg>
        <!-- Emergency: cross / plus -->
        <svg
          v-else
          class="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M9 3h6a1 1 0 0 1 1 1v4h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-4v4a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-4H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h4V4a1 1 0 0 1 1-1Z"
          />
        </svg>
      </span>

      <span
        class="rounded-full px-2.5 py-1 text-xs font-semibold"
        :class="difficultyClass"
      >
        {{ specialty.difficulty }}
      </span>
    </div>

    <h3
      class="relative mt-5 text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
    >
      {{ specialty.title }}
    </h3>
    <p
      class="relative mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400"
    >
      {{ specialty.description }}
    </p>

    <!-- Topic chips -->
    <ul class="relative mt-4 flex flex-wrap gap-1.5">
      <li
        v-for="topic in specialty.topics"
        :key="topic"
        class="rounded-md px-2 py-0.5 text-xs font-medium"
        :class="accent.topic"
      >
        {{ topic }}
      </li>
    </ul>

    <!-- Duration -->
    <div
      class="relative mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
    >
      <svg
        class="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      Estimated {{ specialty.duration }}
    </div>

    <!-- Start session -->
    <button
      type="button"
      class="relative mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.99] dark:focus-visible:ring-offset-slate-900"
      :class="accent.button"
      @click="$emit('start', specialty.id)"
    >
      Start Session
      <svg
        class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </button>
  </article>
</template>
