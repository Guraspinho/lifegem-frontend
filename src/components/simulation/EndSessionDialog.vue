<script setup lang="ts">
defineProps<{ open: boolean }>()

const emit = defineEmits<{ confirm: []; cancel: [] }>()

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') emit('cancel')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="end-session-title"
        tabindex="-1"
        @keydown="onKeydown"
      >
        <div
          class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          @click="emit('cancel')"
        />

        <div
          class="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          <div class="flex items-start gap-4">
            <span
              class="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            >
              <svg
                class="h-6 w-6"
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
            <div class="min-w-0">
              <h3
                id="end-session-title"
                class="text-base font-semibold tracking-tight text-slate-900 dark:text-white"
              >
                End without a final diagnosis?
              </h3>
              <p
                class="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400"
              >
                You haven't submitted a final diagnosis for this patient. If you
                end now, the session will be recorded without one.
              </p>
            </div>
          </div>

          <div class="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus-visible:ring-offset-slate-900"
              @click="emit('cancel')"
            >
              Keep going
            </button>
            <button
              type="button"
              class="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
              @click="emit('confirm')"
            >
              End anyway
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.18s ease;
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
</style>
