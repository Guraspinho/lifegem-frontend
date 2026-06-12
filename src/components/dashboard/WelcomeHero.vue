<script setup lang="ts">
/**
 * Hero-style welcome card. Uses the same indigo→violet brand gradient as the
 * auth brand panel, layered over a faint dotted "monitoring grid" pattern and a
 * soft ambient glow for a calm hospital-dashboard atmosphere.
 */
defineProps<{ name: string }>()
</script>

<template>
  <section
    class="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900"
  >
    <!-- Subtle dotted monitoring grid -->
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.4] [background-image:radial-gradient(theme(colors.indigo.200)_1px,transparent_1px)] [background-size:22px_22px] dark:opacity-[0.06]"
      aria-hidden="true"
    />
    <!-- Ambient glow -->
    <div
      class="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-500/10"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-500/10"
      aria-hidden="true"
    />

    <div class="relative max-w-2xl">
      <span
        class="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/70 bg-white/70 px-3 py-1 text-xs font-medium text-indigo-600 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/70 dark:text-indigo-300"
      >
        <span class="relative flex h-2 w-2">
          <span
            class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
          />
          <span
            class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"
          />
        </span>
        Training environment ready
      </span>

      <h1
        class="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white"
      >
        Welcome back, {{ name }}.
      </h1>
      <p
        class="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300"
      >
        Sharpen your clinical decision-making with realistic, AI-guided patient
        cases. Every session adapts to your choices - diagnose faster, treat
        smarter, and review your reasoning afterward.
      </p>
      <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
        Choose a medical specialty below to begin a new simulation session.
      </p>
    </div>
  </section>
</template>
