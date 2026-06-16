<script setup lang="ts">
/**
 * Full-screen split layout for the auth screens: an edge-to-edge periwinkle
 * brand panel on the left (hidden on small screens) and a white form panel on
 * the right whose rounded left edge overlaps the brand panel, like the design
 * reference. Marketing copy is configurable so both screens reuse it.
 *
 * The stethoscope artwork is a static asset served from `public/` so it is
 * easy to swap. Save the illustration as `public/stethoscope.png`.
 */
withDefaults(
  defineProps<{
    tagline?: string
  }>(),
  {
    tagline: 'Master Clinical Decision-Making Through Realistic Simulations.',
  },
)

// Bound (not static) so Vite resolves it at runtime from `public/` rather than
// trying to bundle it at build time; the app still builds before the file is
// added. Save a transparent PNG as `public/stethoscope.png`.
const stethoscopeSrc = '/stethoscope.png'
</script>

<template>
  <main class="flex min-h-screen w-full overflow-hidden">
    <!-- Brand / marketing panel (full-bleed left half) -->
    <section
      class="relative hidden flex-col bg-gradient-to-br from-indigo-300 via-violet-300 to-violet-400 p-10 text-white md:flex md:w-2/5 lg:p-14"
    >
      <div class="flex items-center gap-2.5">
        <span
          class="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <!-- Heartbeat / ECG mark -->
          <svg
            class="h-5 w-5 text-indigo-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 12h3.5l2-6 3.5 12 2.5-7 1.5 1H21" />
          </svg>
        </span>
        <span class="text-lg font-semibold tracking-tight drop-shadow-sm">
          LifeGem
        </span>
      </div>

      <p
        class="mt-10 max-w-[15rem] text-2xl font-light leading-snug drop-shadow-sm lg:text-3xl"
      >
        {{ tagline }}
      </p>

      <!-- Stethoscope illustration: absolutely positioned so its center lands
           on the seam between the purple panel and the white form, and lifted
           above the white panel (z-20) so it crosses the border. Tune the
           rightward position with `translate-x-1/2`. -->
      <img
        :src="stethoscopeSrc"
        alt=""
        aria-hidden="true"
        class="pointer-events-none absolute right-0 top-1/2 z-20 w-[120%] max-w-none -translate-y-1/3  translate-x-1/3   select-none object-contain"
      />

      <!-- Soft decorative glow -->
      <div
        class="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/20 blur-2xl"
        aria-hidden="true"
      />
    </section>

    <!-- Form panel: full width on mobile; overlaps the brand panel with a
         rounded left edge on md+ -->
    <section
      class="relative z-10 flex w-full flex-col justify-center bg-white px-6 py-12 dark:bg-slate-900 sm:px-10 md:-ml-8 md:w-[calc(60%+2rem)] md:rounded-l-[2.5rem] md:shadow-[-16px_0_40px_-16px_rgba(15,23,42,0.25)] lg:px-20"
    >
      <div class="mx-auto w-full max-w-sm">
        <slot />
      </div>
    </section>
  </main>
</template>
