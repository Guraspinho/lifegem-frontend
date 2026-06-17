<script setup lang="ts">
import { computed } from 'vue'
import type { ChatMessage } from '@/types/chat.types'

const props = defineProps<{ message: ChatMessage }>()

const isDoctor = computed(() => props.message.role === 'doctor')
const isPatient = computed(() => props.message.role === 'patient')
const isSystem = computed(() => props.message.role === 'system')
const showTyping = computed(
  () => props.message.pending && props.message.content.length === 0,
)
</script>

<template>
  <div v-if="isSystem" class="flex justify-center px-2">
    <span
      class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400"
    >
      {{ message.content }}
    </span>
  </div>

  <div
    v-else
    class="flex items-end gap-2.5"
    :class="isDoctor ? 'justify-end' : 'justify-start'"
  >
    <span
      v-if="isPatient"
      class="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-sm"
      aria-hidden="true"
    >
      <svg
        class="h-4 w-4"
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

    <div
      class="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm"
      :class="
        isDoctor
          ? 'rounded-br-md bg-indigo-600 text-white'
          : 'rounded-bl-md bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
      "
    >
      <span v-if="showTyping" class="flex items-center gap-1 py-1">
        <span class="typing-dot" />
        <span class="typing-dot" />
        <span class="typing-dot" />
      </span>
      <span v-else class="whitespace-pre-wrap">{{ message.content }}</span>
    </div>
  </div>
</template>

<style scoped>
.typing-dot {
  height: 0.45rem;
  width: 0.45rem;
  border-radius: 9999px;
  background-color: currentColor;
  opacity: 0.4;
  animation: typing-bounce 1.2s ease-in-out infinite;
}
.typing-dot:nth-child(2) {
  animation-delay: 0.15s;
}
.typing-dot:nth-child(3) {
  animation-delay: 0.3s;
}
@keyframes typing-bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-3px);
    opacity: 0.9;
  }
}
@media (prefers-reduced-motion: reduce) {
  .typing-dot {
    animation: none;
  }
}
</style>
