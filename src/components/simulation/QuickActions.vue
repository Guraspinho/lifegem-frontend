<script setup lang="ts">
import type { QuickAction } from '@/types/chat.types'

defineProps<{
  actions: QuickAction[]
  disabled?: boolean
}>()

defineEmits<{ select: [action: QuickAction] }>()
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="action in actions"
      :key="action.id"
      type="button"
      :disabled="disabled"
      class="group flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:text-indigo-300"
      @click="$emit('select', action)"
    >
      <svg
        class="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <template v-if="action.icon === 'history'">
          <path d="M12 8v4l3 2" />
          <circle cx="12" cy="12" r="9" />
        </template>
        <template v-else-if="action.icon === 'pain'">
          <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
        </template>
        <template v-else-if="action.icon === 'vitals'">
          <path d="M3 12h4l2-6 4 12 2-6h6" />
        </template>
        <template v-else-if="action.icon === 'meds'">
          <path d="M10.5 20.5 3.5 13.5a4 4 0 0 1 5.7-5.7l7 7a4 4 0 0 1-5.7 5.7Z" />
          <path d="m8.5 8.5 7 7" />
        </template>
        <template v-else-if="action.icon === 'exam'">
          <path d="M4 3v7a5 5 0 0 0 10 0V3" />
          <path d="M9 14v3a4 4 0 0 0 8 0v-2" />
          <circle cx="19" cy="13" r="2" />
        </template>
        <template v-else>
          <path d="M9 3v6l-5 9a2 2 0 0 0 1.8 3h12.4a2 2 0 0 0 1.8-3l-5-9V3" />
          <path d="M8 3h8" />
        </template>
      </svg>
      {{ action.label }}
    </button>
  </div>
</template>
