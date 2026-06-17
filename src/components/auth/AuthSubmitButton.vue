<script setup lang="ts">
withDefaults(
  defineProps<{
    loading?: boolean
    disabled?: boolean
    label: string
    loadingLabel?: string
  }>(),
  {
    loading: false,
    disabled: false,
    loadingLabel: 'Please wait…',
  },
)
</script>

<template>
  <button
    type="submit"
    :disabled="loading || disabled"
    class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 dark:focus-visible:ring-offset-slate-900"
  >
    <svg
      v-if="loading"
      class="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
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
    <span>{{ loading ? loadingLabel : label }}</span>
  </button>
</template>
