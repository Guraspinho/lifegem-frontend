<script setup lang="ts">
withDefaults(
  defineProps<{
    tagline?: string
  }>(),
  {
    tagline: 'Master Clinical Decision-Making Through Realistic Simulations.',
  },
)

const stethoscopeSrc = '/stethoscope.png'
</script>

<template>
  <main class="flex min-h-screen w-full overflow-hidden">
    <section
      class="relative hidden flex-col bg-gradient-to-br from-indigo-300 via-violet-300 to-violet-400 p-10 text-white md:flex md:w-2/5 lg:p-14"
    >
      <div class="flex items-center gap-2.5">
        <span
          class="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
        >
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

      <img
        :src="stethoscopeSrc"
        alt=""
        aria-hidden="true"
        class="pointer-events-none absolute right-0 top-1/2 z-20 w-[120%] max-w-none -translate-y-1/3  translate-x-1/3   select-none object-contain"
      />

      <div
        class="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/20 blur-2xl"
        aria-hidden="true"
      />
    </section>

    <section
      class="relative z-10 flex w-full flex-col justify-center bg-white px-6 py-12 dark:bg-slate-900 sm:px-10 md:-ml-8 md:w-[calc(60%+2rem)] md:rounded-l-[2.5rem] md:shadow-[-16px_0_40px_-16px_rgba(15,23,42,0.25)] lg:px-20"
    >
      <div class="mx-auto w-full max-w-sm">
        <slot />
      </div>
    </section>
  </main>
</template>
