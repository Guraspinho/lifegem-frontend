<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useUser } from '@/composables/useUser'
import DashboardNav from '@/components/dashboard/DashboardNav.vue'
import WelcomeHero from '@/components/dashboard/WelcomeHero.vue'
import SpecialtyCard from '@/components/dashboard/SpecialtyCard.vue'
import DashboardInsights from '@/components/dashboard/DashboardInsights.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import { specialties } from '@/data/dashboard'
import type { DashboardStat, DashboardUser } from '@/types/dashboard.types'

const { logout } = useAuth()
const { user, fetchUser, error: userError } = useUser()
const router = useRouter()

const statsLoading = computed(() => !user.value && !userError.value)

onMounted(fetchUser)

const firstName = computed(() => user.value?.name ?? 'Doctor')

const navUser = computed<DashboardUser>(() => {
  const u = user.value
  const name = u ? `${u.name} ${u.surname}` : 'Loading…'
  const initials = u
    ? `${u.name.charAt(0)}${u.surname.charAt(0)}`.toUpperCase()
    : '–'
  return { name, initials }
})

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

function startSession(specialtyId: string): void {
  void router.push({ name: 'simulation', params: { specialty: specialtyId } })
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950">
    <DashboardNav :user="navUser" @logout="logout" />

    <main
      class="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
    >
      <WelcomeHero :name="firstName" />

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

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section class="lg:col-span-2">
          <div class="mb-4">
            <h2
              class="text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
            >
              Your performance
            </h2>
            <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Your lifetime training metrics across every completed simulation.
            </p>
          </div>
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <StatCard
              v-for="stat in stats"
              :key="stat.id"
              :stat="stat"
              :loading="statsLoading"
            />
          </div>
        </section>

        <div class="lg:col-span-1">
          <DashboardInsights />
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
