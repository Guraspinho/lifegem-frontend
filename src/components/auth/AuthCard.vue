<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="w-full">
    <header class="mb-6">
      <h1
        class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"
      >
        {{ title }}
      </h1>
      <p v-if="subtitle" class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {{ subtitle }}
      </p>
    </header>

    <slot />

    <footer v-if="$slots.footer" class="mt-6 text-center text-sm">
      <slot name="footer" />
    </footer>
  </div>
</template>
