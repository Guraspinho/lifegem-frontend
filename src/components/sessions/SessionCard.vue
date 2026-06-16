<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SpecialtyAccent } from '@/types/dashboard.types'
import type { UserSession } from '@/types/user.types'
import {
  formatDuration,
  formatSessionDate,
  scoreBadgeClass,
  specialtyAccent,
  specialtyLabel,
  statusLabel,
} from '@/utils/sessions'

const props = defineProps<{ session: UserSession }>()
const emit = defineEmits<{ view: [id: number] }>()

const expanded = ref(false)

const DOT: Record<SpecialtyAccent, string> = {
  red: 'bg-red-500',
  indigo: 'bg-indigo-500',
  cyan: 'bg-cyan-500',
}

const accent = computed(() => specialtyAccent(props.session.specialty))
const title = computed(
  () =>
    props.session.condition ||
    props.session.patient_name ||
    `${specialtyLabel(props.session.specialty)} case`,
)
const isCompleted = computed(() => props.session.score !== null)
</script>

<template>
  <div
    class="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
  >
    <button
      type="button"
      class="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      @click="expanded = !expanded"
    >
      <span
        class="h-2.5 w-2.5 shrink-0 rounded-full"
        :class="DOT[accent]"
        aria-hidden="true"
      />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
          {{ title }}
        </p>
        <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {{ specialtyLabel(session.specialty) }} ·
          {{ formatSessionDate(session.createdAt) }}
        </p>
      </div>

      <span
        v-if="isCompleted"
        class="shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold"
        :class="scoreBadgeClass(session.score as number)"
      >
        {{ Math.round(session.score as number) }}%
      </span>
      <span
        v-else
        class="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      >
        {{ statusLabel(session.status) }}
      </span>

      <svg
        class="h-4 w-4 shrink-0 text-slate-400 transition-transform"
        :class="{ 'rotate-180': expanded }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <Transition name="expand">
      <div
        v-if="expanded"
        class="border-t border-slate-100 px-4 py-4 dark:border-slate-800"
      >
        <div class="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          <div>
            <p
              class="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500"
            >
              Patient
            </p>
            <p class="mt-0.5 text-sm text-slate-700 dark:text-slate-300">
              {{ session.patient_name || '—' }}
            </p>
          </div>
          <div>
            <p
              class="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500"
            >
              Duration
            </p>
            <p
              class="mt-0.5 text-sm tabular-nums text-slate-700 dark:text-slate-300"
            >
              {{ formatDuration(session.duration_seconds) }}
            </p>
          </div>
          <div>
            <p
              class="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500"
            >
              Outcome
            </p>
            <p
              v-if="session.patient_survived !== null"
              class="mt-0.5 text-sm font-medium"
              :class="
                session.patient_survived
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              "
            >
              {{ session.patient_survived ? 'Patient survived' : 'Patient deceased' }}
            </p>
            <p v-else class="mt-0.5 text-sm text-slate-400 dark:text-slate-500">
              —
            </p>
          </div>

          <div class="col-span-2 sm:col-span-3">
            <p
              class="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500"
            >
              Actual condition
            </p>
            <p class="mt-0.5 text-sm text-slate-700 dark:text-slate-300">
              {{ session.condition || '—' }}
            </p>
          </div>

          <div class="col-span-2 sm:col-span-3">
            <p
              class="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500"
            >
              Your diagnosis
              <span
                v-if="session.correct_diagnosis !== null"
                class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold normal-case"
                :class="
                  session.correct_diagnosis
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                "
              >
                {{ session.correct_diagnosis ? 'Correct' : 'Incorrect' }}
              </span>
            </p>
            <p
              class="mt-0.5 text-sm text-slate-700 dark:text-slate-300"
              :class="{ 'italic text-slate-400 dark:text-slate-500': !session.final_diagnosis }"
            >
              {{ session.final_diagnosis || 'No final diagnosis submitted.' }}
            </p>
          </div>
        </div>

        <button
          v-if="isCompleted"
          type="button"
          class="mt-4 flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          @click="emit('view', session.id)"
        >
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.9"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 3v18h18" />
            <path d="M7 15l3-4 3 2 4-6" />
          </svg>
          View full analysis
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
