<script setup lang="ts">
/**
 * Single analytics stat. Minimal, data-driven card with an icon, the headline
 * value and a label. When the value is null (e.g. the user hasn't completed any
 * sessions yet) the number is replaced by a muted "No sessions yet" placeholder
 * so empty metrics read as expected rather than as an error.
 */
import { computed } from 'vue'
import type { DashboardStat } from '@/types/dashboard.types'

const props = defineProps<{ stat: DashboardStat }>()

const hasValue = computed(() => props.stat.value !== null)
</script>

<template>
  <div
    class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
  >
    <div class="flex items-center justify-between">
      <span
        class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
      >
        <svg
          class="h-5 w-5"
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

    <p
      v-if="hasValue"
      class="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"
    >
      {{ stat.value }}{{ stat.unit }}
    </p>
    <p
      v-else
      class="mt-4 text-base font-medium text-slate-400 dark:text-slate-500"
    >
      No sessions yet
    </p>
    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
      {{ stat.label }}
    </p>
  </div>
</template>
