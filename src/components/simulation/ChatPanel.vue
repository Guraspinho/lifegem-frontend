<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import ChatBubble from './ChatBubble.vue'
import QuickActions from './QuickActions.vue'
import { quickActions } from '@/data/simulation'
import type { ChatMessage, QuickAction } from '@/types/chat.types'

const props = defineProps<{
  messages: ChatMessage[]
  active: boolean
  thinking?: boolean
}>()

const emit = defineEmits<{ send: [text: string] }>()

const draft = ref('')
const scroller = ref<HTMLElement | null>(null)

function submit(): void {
  const text = draft.value.trim()
  if (!text || !props.active) return
  emit('send', text)
  draft.value = ''
}

function onQuickAction(action: QuickAction): void {
  if (!props.active) return
  emit('send', action.prompt)
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
  }
}

watch(
  () => props.messages.map((m) => m.content).join('|'),
  async () => {
    await nextTick()
    const el = scroller.value
    if (el) el.scrollTop = el.scrollHeight
  },
)
</script>

<template>
  <section
    class="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/70 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60"
  >
    <div
      class="flex items-center gap-2 border-b border-slate-200/80 px-5 py-3.5 dark:border-slate-800"
    >
      <span
        class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
      >
        <svg
          class="h-4.5 w-4.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
        </svg>
      </span>
      <div class="leading-tight">
        <h2
          class="text-sm font-semibold tracking-tight text-slate-900 dark:text-white"
        >
          Consultation
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Speak with the patient to reach a diagnosis
        </p>
      </div>
    </div>

    <div
      ref="scroller"
      class="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5"
    >
      <ChatBubble v-for="m in messages" :key="m.id" :message="m" />
    </div>

    <div
      class="space-y-3 border-t border-slate-200/80 px-4 py-3.5 sm:px-5 dark:border-slate-800"
    >
      <QuickActions
        :actions="quickActions"
        :disabled="!active"
        @select="onQuickAction"
      />

      <form class="flex items-end gap-2" @submit.prevent="submit">
        <textarea
          v-model="draft"
          rows="1"
          :disabled="!active"
          placeholder="Type your message to the patient…"
          class="max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800/50"
          @keydown="onKeydown"
        />
        <button
          type="submit"
          :disabled="!active || !draft.trim()"
          class="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900"
          aria-label="Send message"
        >
          <svg
            v-if="thinking"
            class="h-5 w-5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4Z"
            />
          </svg>
          <svg
            v-else
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </button>
      </form>
    </div>
  </section>
</template>
