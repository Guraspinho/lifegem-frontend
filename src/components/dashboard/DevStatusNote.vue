<script setup lang="ts">
/**
 * Quiet informational banner explaining that the platform is in active
 * development and the data shown is currently mocked. Styled as a calm info
 * note (indigo/slate), deliberately not a warning, so it reads as transparency
 * rather than an error.
 */
</script>

<template>
  <div
    class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-800/40"
  >
    <span
      class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
    >
      <svg
        class="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 8h.01" />
        <path d="M11 12h1v4h1" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    </span>
    <p class="text-slate-600 dark:text-slate-400">
      <span class="font-semibold text-slate-700 dark:text-slate-200">
        Platform in active development.
      </span>
      Statistics, sessions and scores shown here are temporarily mocked.
      Backend-powered, dynamic simulation data will be integrated soon.
    </p>
  </div>
</template>
