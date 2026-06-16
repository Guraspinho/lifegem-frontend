<script setup lang="ts"></script>

<template>
  <footer
    class="mt-12 border-t border-slate-200/80 bg-white/60 dark:border-slate-800 dark:bg-slate-900/40"
  >
    <div class="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div class="flex flex-col items-center gap-2">
        <svg
          class="ember h-4 w-4 text-amber-500"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M12 2c1 3-1 4-1 6a3 3 0 0 0 5 2c1 2 1 3 1 4a5 5 0 0 1-10 0c0-3 2-5 3-7 1-1.5 2-3 2-5Z"
          />
        </svg>
        <p class="soapstone text-center text-sm italic tracking-wide">
          Let LifeGem save people's lives, as it once saved mine.
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.soapstone {
  color: #f59e0b;
  text-shadow:
    0 0 8px rgba(245, 158, 11, 0.55),
    0 0 18px rgba(245, 158, 11, 0.3);
  animation: soapstone-glow 3.5s ease-in-out infinite;
}

.ember {
  filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.6));
  animation: soapstone-glow 3.5s ease-in-out infinite;
}

@keyframes soapstone-glow {
  0%,
  100% {
    opacity: 0.78;
  }
  50% {
    opacity: 1;
  }
}
</style>
