<script setup lang="ts">
/**
 * Animated ECG monitor for the simulated patient, shown in the top-right of the
 * simulation header. Reuses the ECG waveform from the brand mark and scrolls a
 * repeating trace across a small "monitor" so the patient reads as alive.
 *
 * States:
 *   alive=false  → flat line, muted (patient not generated / session ended)
 *   alive=true   → green scrolling trace + pulsing BPM readout
 */
withDefaults(
  defineProps<{
    /** Whether the patient is generated and the monitor should animate. */
    alive?: boolean
    /** Displayed beats-per-minute readout. */
    bpm?: number
  }>(),
  { alive: false, bpm: 78 },
)
</script>

<template>
  <div
    class="flex items-center gap-3 rounded-xl border px-3 py-1.5 transition-colors duration-500"
    :class="
      alive
        ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/10'
        : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60'
    "
  >
    <!-- Scrolling ECG monitor -->
    <div
      class="relative h-9 w-28 overflow-hidden rounded-md sm:w-36"
      aria-hidden="true"
    >
      <svg
        v-if="alive"
        class="ecg-trace h-full text-emerald-500 dark:text-emerald-400"
        viewBox="0 0 96 36"
        preserveAspectRatio="none"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <!-- Two stitched waveforms so the scroll loops seamlessly. -->
        <path
          d="M0 18h6l2-6 4 14 3-18 2 10 3-2h7M48 18h6l2-6 4 14 3-18 2 10 3-2h7"
        />
      </svg>
      <!-- Flatline when the patient isn't alive. -->
      <svg
        v-else
        class="h-full w-full text-slate-300 dark:text-slate-600"
        viewBox="0 0 96 36"
        preserveAspectRatio="none"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      >
        <path d="M0 18h96" />
      </svg>
    </div>

    <!-- BPM readout -->
    <div class="flex items-center gap-1.5 leading-none">
      <svg
        class="h-4 w-4 transition-colors duration-500"
        :class="
          alive
            ? 'heart-beat text-rose-500 dark:text-rose-400'
            : 'text-slate-300 dark:text-slate-600'
        "
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M12 21s-7.5-4.9-10-9.4C.6 8.9 2 5.5 5.2 5.1c1.9-.2 3.4.8 4.3 2.3.9-1.5 2.4-2.5 4.3-2.3 3.2.4 4.6 3.8 3.2 6.5C19.5 16.1 12 21 12 21Z"
        />
      </svg>
      <div class="flex items-baseline gap-1">
        <span
          class="text-base font-semibold tabular-nums tracking-tight transition-colors duration-500"
          :class="
            alive
              ? 'text-emerald-600 dark:text-emerald-300'
              : 'text-slate-400 dark:text-slate-500'
          "
        >
          {{ alive ? bpm : '––' }}
        </span>
        <span
          class="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500"
        >
          BPM
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scroll the stitched waveform left by exactly one wave so it loops cleanly. */
.ecg-trace {
  width: 200%;
  animation: ecg-scroll 1.6s linear infinite;
}
@keyframes ecg-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

/* Subtle heart pulse synced roughly to the trace cadence. */
.heart-beat {
  animation: heart-pulse 1.6s ease-in-out infinite;
  transform-origin: center;
}
@keyframes heart-pulse {
  0%,
  60%,
  100% {
    transform: scale(1);
  }
  15% {
    transform: scale(1.25);
  }
  30% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ecg-trace,
  .heart-beat {
    animation: none;
  }
}
</style>
