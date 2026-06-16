<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useUser } from '@/composables/useUser'
import { useUserSessions } from '@/composables/useUserSessions'
import { useUserSession } from '@/composables/useUserSession'
import DashboardNav from '@/components/dashboard/DashboardNav.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import ScoreTrendChart from '@/components/sessions/ScoreTrendChart.vue'
import SessionCard from '@/components/sessions/SessionCard.vue'
import SessionDetailModal from '@/components/sessions/SessionDetailModal.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import { specialtyAccent, specialtyLabel } from '@/utils/sessions'
import type { DashboardStat, DashboardUser, SpecialtyAccent } from '@/types/dashboard.types'

const router = useRouter()
const { logout } = useAuth()
const { user, fetchUser, error: userError } = useUser()

const statsLoading = computed(() => !user.value && !userError.value)
const {
  sessions,
  isLoading,
  isLoadingMore,
  error,
  hasMore,
  isEmpty,
  fetchInitial,
  loadMore,
} = useUserSessions(12)

const {
  session: detail,
  isLoading: detailLoading,
  error: detailError,
  fetchSession,
  clear: clearDetail,
} = useUserSession()

const activeSpecialty = ref<string>('all')
const showDetail = ref(false)

onMounted(() => {
  fetchUser()
  fetchInitial()
})

function openDetail(id: number): void {
  showDetail.value = true
  fetchSession(id)
}

function closeDetail(): void {
  showDetail.value = false
  clearDetail()
}

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

function shortDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const trendPoints = computed(() =>
  [...sessions.value]
    .filter((s) => s.score !== null)
    .reverse()
    .slice(-12)
    .map((s) => ({ label: shortDate(s.createdAt), value: s.score as number })),
)

const trendAverage = computed(() => {
  const values = trendPoints.value.map((p) => p.value)
  if (!values.length) return null
  return values.reduce((a, b) => a + b, 0) / values.length
})

const ACCENT_BAR: Record<SpecialtyAccent, string> = {
  red: 'bg-red-500',
  indigo: 'bg-indigo-500',
  cyan: 'bg-cyan-500',
}

const bySpecialty = computed(() => {
  const groups = new Map<
    string,
    { specialty: string; count: number; scored: number[] }
  >()
  for (const s of sessions.value) {
    const g = groups.get(s.specialty) ?? {
      specialty: s.specialty,
      count: 0,
      scored: [],
    }
    g.count += 1
    if (s.score !== null) g.scored.push(s.score)
    groups.set(s.specialty, g)
  }
  return [...groups.values()]
    .map((g) => ({
      specialty: g.specialty,
      label: specialtyLabel(g.specialty),
      accent: specialtyAccent(g.specialty),
      count: g.count,
      avg: g.scored.length
        ? Math.round(g.scored.reduce((a, b) => a + b, 0) / g.scored.length)
        : null,
    }))
    .sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1))
})

const specialtyFilters = computed(() => [
  { value: 'all', label: 'All' },
  ...bySpecialty.value.map((g) => ({ value: g.specialty, label: g.label })),
])

const filteredSessions = computed(() =>
  activeSpecialty.value === 'all'
    ? sessions.value
    : sessions.value.filter((s) => s.specialty === activeSpecialty.value),
)

function startTraining(): void {
  void router.push({ name: 'home' })
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950">
    <DashboardNav :user="navUser" @logout="logout" />

    <main class="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1
            class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"
          >
            Your sessions
          </h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review past consultations, track your scores and spot patterns over
            time.
          </p>
        </div>
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          @click="startTraining"
        >
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New simulation
        </button>
      </div>

      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          v-for="stat in stats"
          :key="stat.id"
          :stat="stat"
          :loading="statsLoading"
        />
      </div>

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <section
          class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-3"
        >
          <div class="mb-5 flex items-center justify-between">
            <h2
              class="text-base font-semibold tracking-tight text-slate-900 dark:text-white"
            >
              Score trend
            </h2>
            <span class="text-xs text-slate-400 dark:text-slate-500">
              Recent completed sessions
            </span>
          </div>
          <ScoreTrendChart :points="trendPoints" :average="trendAverage" />
        </section>

        <section
          class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2"
        >
          <h2
            class="mb-5 text-base font-semibold tracking-tight text-slate-900 dark:text-white"
          >
            By specialty
          </h2>

          <div v-if="!bySpecialty.length" class="py-8 text-center">
            <p class="text-sm text-slate-400 dark:text-slate-500">
              No data yet.
            </p>
          </div>
          <ul v-else class="space-y-4">
            <li v-for="g in bySpecialty" :key="g.specialty">
              <div class="mb-1.5 flex items-center justify-between text-sm">
                <span class="font-medium text-slate-700 dark:text-slate-300">
                  {{ g.label }}
                </span>
                <span class="text-xs text-slate-400 dark:text-slate-500">
                  {{ g.count }} {{ g.count === 1 ? 'session' : 'sessions' }}
                </span>
              </div>
              <div class="flex items-center gap-3">
                <div
                  class="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                >
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="ACCENT_BAR[g.accent]"
                    :style="{ width: `${g.avg ?? 0}%` }"
                  />
                </div>
                <span
                  class="w-10 shrink-0 text-right text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-300"
                >
                  {{ g.avg === null ? '—' : `${g.avg}%` }}
                </span>
              </div>
            </li>
          </ul>
        </section>
      </div>

      <section>
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2
            class="text-base font-semibold tracking-tight text-slate-900 dark:text-white"
          >
            All sessions
          </h2>
          <div v-if="specialtyFilters.length > 1" class="flex flex-wrap gap-1.5">
            <button
              v-for="f in specialtyFilters"
              :key="f.value"
              type="button"
              class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
              :class="
                activeSpecialty === f.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800'
              "
              @click="activeSpecialty = f.value"
            >
              {{ f.label }}
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="space-y-3">
          <div
            v-for="n in 5"
            :key="n"
            class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900"
          >
            <span class="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div class="flex-1 space-y-2">
              <div class="h-3 w-2/5 rounded bg-slate-200 dark:bg-slate-700" />
              <div class="h-2.5 w-1/4 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
            <div class="h-6 w-12 rounded-lg bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>

        <div
          v-else-if="error"
          class="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900"
        >
          <p class="text-sm font-medium text-slate-700 dark:text-slate-300">
            Couldn't load your sessions
          </p>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {{ error }}
          </p>
        </div>

        <div
          v-else-if="isEmpty"
          class="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900"
        >
          <span
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
          >
            <svg
              class="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 12h4l2-6 4 12 2-6h6" />
            </svg>
          </span>
          <p class="mt-4 text-base font-semibold text-slate-800 dark:text-slate-100">
            No sessions yet
          </p>
          <p
            class="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400"
          >
            Complete your first AI-guided simulation and your history, scores and
            analysis will appear here.
          </p>
          <button
            type="button"
            class="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            @click="startTraining"
          >
            Start a simulation
          </button>
        </div>

        <template v-else>
          <div class="space-y-3">
            <SessionCard
              v-for="session in filteredSessions"
              :key="session.id"
              :session="session"
              @view="openDetail"
            />
          </div>

          <div v-if="hasMore" class="mt-5 flex justify-center">
            <button
              type="button"
              :disabled="isLoadingMore"
              class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              @click="loadMore"
            >
              <svg
                v-if="isLoadingMore"
                class="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-90"
                  fill="currentColor"
                  d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4Z"
                />
              </svg>
              {{ isLoadingMore ? 'Loading…' : 'Load more sessions' }}
            </button>
          </div>
        </template>
      </section>
    </main>

    <AppFooter />

    <SessionDetailModal
      :open="showDetail"
      :loading="detailLoading"
      :error="detailError"
      :detail="detail"
      @close="closeDetail"
    />
  </div>
</template>
