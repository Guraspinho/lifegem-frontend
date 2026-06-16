<script setup lang="ts">
/**
 * LifeGem dashboard, the authenticated landing page (protected `/` route).
 *
 * Assembles the dashboard shell from focused components and feeds them static
 * demo data from `@/data/dashboard` while the backend is still in progress.
 * Auth wiring is left as-is: logout flows through the existing `useAuth`.
 */
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useUser } from '@/composables/useUser'
import DashboardNav from '@/components/dashboard/DashboardNav.vue'
import WelcomeHero from '@/components/dashboard/WelcomeHero.vue'
import SpecialtyCard from '@/components/dashboard/SpecialtyCard.vue'
import RecentSessions from '@/components/dashboard/RecentSessions.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import DevStatusNote from '@/components/dashboard/DevStatusNote.vue'
import { recentSessions, specialties } from '@/data/dashboard'
import type { DashboardStat, DashboardUser } from '@/types/dashboard.types'

const { logout } = useAuth()
const { user, fetchUser } = useUser()
const router = useRouter()

onMounted(fetchUser)

// First name only for the hero greeting; falls back to a neutral label while
// the request is in flight or if it fails.
const firstName = computed(() => user.value?.name ?? 'Doctor')

// Nav profile derived from the live user. Role is unknown from the API, so it
// is intentionally omitted (the nav hides it when absent).
const navUser = computed<DashboardUser>(() => {
  const u = user.value
  const name = u ? `${u.name} ${u.surname}` : 'Loading…'
  const initials = u
    ? `${u.name.charAt(0)}${u.surname.charAt(0)}`.toUpperCase()
    : '–'
  return { name, initials }
})

// Performance cards mapped from the API metrics. Null metrics (no sessions yet)
// flow through as null and StatCard renders a "No sessions yet" placeholder.
const stats = computed<DashboardStat[]>(() => {
  const u = user.value
  return [
    {
      id: 'total',
      label: 'Simulations completed',
      value: u?.completed_simulations ?? null,
      icon: 'pulse',
    },
    {
      id: 'avg-score',
      label: 'Average score',
      value: u?.average_score ?? null,
      unit: '%',
      icon: 'target',
    },
    {
      id: 'survival',
      label: 'Patient survival rate',
      value: u?.survival_rate ?? null,
      unit: '%',
      icon: 'shield',
    },
    {
      id: 'diagnosis',
      label: 'Correct diagnosis rate',
      value: u?.correct_diagnosis_rate ?? null,
      unit: '%',
      icon: 'check',
    },
  ]
})

// Enter the live simulation for the chosen specialty. The view opens the
// WebSocket session (connect → start_session → chat) on mount.
function startSession(specialtyId: string): void {
  void router.push({ name: 'simulation', params: { specialty: specialtyId } })
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950">
    <DashboardNav
      :user="navUser"
      :notifications="3"
      @logout="logout"
    />

    <main
      class="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
    >
      <WelcomeHero :name="firstName" />

      <!-- Specialty selection: primary call-to-action -->
      <section>
        <div class="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2
              class="text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
            >
              Choose a specialty
            </h2>
            <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Start a new AI-guided simulation in one of three clinical tracks.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <SpecialtyCard
            v-for="specialty in specialties"
            :key="specialty.id"
            :specialty="specialty"
            @start="startSession"
          />
        </div>
      </section>

      <!-- Analytics + history -->
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section class="lg:col-span-2">
          <h2
            class="mb-4 text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
          >
            Your performance
          </h2>
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <StatCard v-for="stat in stats" :key="stat.id" :stat="stat" />
          </div>
        </section>

        <div class="lg:col-span-1">
          <RecentSessions :sessions="recentSessions" />
        </div>
      </div>

      <DevStatusNote />
    </main>
  </div>
</template>
