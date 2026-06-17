<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  submitted: string
  disabled?: boolean
}>()

const emit = defineEmits<{ submit: [text: string] }>()

const draft = ref(props.submitted)

watch(
  () => props.submitted,
  (value) => {
    if (draft.value.trim() === '' || draft.value === props.submitted) {
      draft.value = value
    }
  },
)

const dirty = computed(() => draft.value.trim() !== props.submitted.trim())
const hasSubmitted = computed(() => props.submitted.trim().length > 0)

function submit(): void {
  if (props.disabled || !dirty.value) return
  emit('submit', draft.value)
}
</script>

<template>
  <section
    class="flex flex-none flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/70 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60"
  >
    <div
      class="flex items-center justify-between gap-2 border-b border-slate-200/80 px-4 py-3 dark:border-slate-800"
    >
      <div class="flex items-center gap-2">
        <span
          class="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
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
            <path d="M9 4h6a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2V5a1 1 0 0 1 1-1Z" />
            <path d="M9 4h6v2H9z" />
            <path d="m9.5 13 1.5 1.5L14 11" />
          </svg>
        </span>
        <h2
          class="text-sm font-semibold tracking-tight text-slate-900 dark:text-white"
        >
          Final diagnosis
        </h2>
      </div>

      <span
        v-if="!disabled"
        class="flex items-center gap-1.5 text-xs font-medium"
        :class="
          dirty
            ? 'text-amber-600 dark:text-amber-400'
            : hasSubmitted
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-400 dark:text-slate-500'
        "
      >
        <span
          class="inline-block h-1.5 w-1.5 rounded-full"
          :class="
            dirty
              ? 'bg-amber-500'
              : hasSubmitted
                ? 'bg-emerald-500'
                : 'bg-slate-300 dark:bg-slate-600'
          "
        />
        {{ dirty ? 'Unsaved' : hasSubmitted ? 'Saved' : 'Not set' }}
      </span>
    </div>

    <div class="flex flex-col gap-2.5 p-4">
      <textarea
        v-model="draft"
        rows="3"
        :disabled="disabled"
        placeholder="Record your working diagnosis, you can revise it any time before ending the session…"
        class="max-h-40 min-h-[4.5rem] w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 shadow-sm transition-colors placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800/50"
      />

      <button
        type="button"
        :disabled="disabled || !dirty"
        class="flex items-center justify-center gap-2 self-end rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900"
        @click="submit"
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
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {{ hasSubmitted ? 'Update diagnosis' : 'Submit diagnosis' }}
      </button>
    </div>
  </section>
</template>
