<script setup lang="ts">
/**
 * Sticky top navigation for the dashboard. Carries the LifeGem brand mark +
 * tagline on the left and the user/notification/logout cluster on the right.
 * Reuses the ECG heartbeat mark and indigo palette from the auth screens so the
 * signed-in shell feels continuous with login/register.
 */
import type { DashboardUser } from '@/types/dashboard.types'

defineProps<{
  user: DashboardUser
  /** Unread notification count; the badge hides when zero. */
  notifications?: number
}>()

defineEmits<{ logout: [] }>()
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div
      class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
    >
      <!-- Brand -->
      <div class="flex items-center gap-3">
        <span
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-sm shadow-indigo-500/30"
        >
          <svg
            class="h-5 w-5 text-white"
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
        <div class="leading-tight">
          <p
            class="text-base font-semibold tracking-tight text-slate-900 dark:text-white"
          >
            LifeGem
          </p>
          <p class="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
            Interactive Medical Training Simulator
          </p>
        </div>
      </div>

      <!-- User cluster -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Notifications -->
        <button
          type="button"
          aria-label="Notifications"
          class="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <svg
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span
            v-if="notifications && notifications > 0"
            class="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white dark:ring-slate-900"
          >
            {{ notifications > 9 ? '9+' : notifications }}
          </span>
        </button>

        <!-- Profile -->
        <div
          class="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-1 sm:pr-3 sm:hover:bg-slate-100 sm:dark:hover:bg-slate-800"
        >
          <span
            class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-sm font-semibold text-white shadow-sm"
          >
            {{ user.initials }}
          </span>
          <span class="hidden leading-tight sm:block">
            <span
              class="block text-sm font-semibold text-slate-800 dark:text-slate-100"
            >
              {{ user.name }}
            </span>
            <span
              v-if="user.role"
              class="block text-xs text-slate-500 dark:text-slate-400"
            >
              {{ user.role }}
            </span>
          </span>
        </div>

        <!-- Logout -->
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus-visible:ring-offset-slate-900"
          @click="$emit('logout')"
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
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          <span class="hidden sm:inline">Log out</span>
        </button>
      </div>
    </div>
  </header>
</template>
