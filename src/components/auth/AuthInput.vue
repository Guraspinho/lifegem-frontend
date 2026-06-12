<script setup lang="ts">
import { computed, ref, useId } from 'vue'

/**
 * Accessible underline input with a floating label, inline error display and an
 * optional password visibility toggle. Used by every auth form so styling +
 * a11y stay consistent in one place.
 */
interface Props {
  modelValue: string
  label: string
  type?: 'text' | 'email' | 'password'
  autocomplete?: string
  error?: string | null
  required?: boolean
  disabled?: boolean
  maxlength?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  autocomplete: undefined,
  error: null,
  required: false,
  disabled: false,
  maxlength: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const uid = useId()
const errorId = computed(() => `${uid}-error`)

// Password fields render a show/hide toggle that swaps the input type.
const isPassword = computed(() => props.type === 'password')
const reveal = ref(false)
const resolvedType = computed(() =>
  isPassword.value ? (reveal.value ? 'text' : 'password') : props.type,
)

const onInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="space-y-1">
    <div class="relative">
      <!-- placeholder=" " keeps :placeholder-shown accurate for the float -->
      <input
        :id="uid"
        :type="resolvedType"
        :value="modelValue"
        placeholder=" "
        :autocomplete="autocomplete"
        :required="required"
        :disabled="disabled"
        :maxlength="maxlength"
        :aria-invalid="!!error"
        :aria-describedby="error ? errorId : undefined"
        class="peer block w-full appearance-none border-0 border-b-2 bg-transparent px-0 pb-2 pt-5 text-sm text-slate-900 outline-none transition-colors duration-200 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-100"
        :class="[
          error
            ? 'border-red-400 focus:border-red-500'
            : 'border-slate-300 focus:border-indigo-500 dark:border-slate-600 dark:focus:border-indigo-400',
          isPassword ? 'pr-9' : '',
        ]"
        @input="onInput"
        @blur="emit('blur')"
      />

      <!-- Floating label: sits in-field when empty, floats up on focus/fill -->
      <label
        :for="uid"
        class="pointer-events-none absolute left-0 top-1 origin-left text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs"
        :class="
          error
            ? 'peer-focus:text-red-500'
            : 'peer-focus:text-indigo-500 dark:peer-focus:text-indigo-400'
        "
      >
        {{ label }}<span v-if="required" aria-hidden="true">&nbsp;*</span>
      </label>

      <button
        v-if="isPassword"
        type="button"
        :aria-label="reveal ? 'Hide password' : 'Show password'"
        :aria-pressed="reveal"
        class="absolute right-0 top-4 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus-visible:text-indigo-500 dark:hover:text-slate-200"
        tabindex="-1"
        @click="reveal = !reveal"
      >
        <!-- Eye / eye-off icon -->
        <svg
          v-if="reveal"
          class="h-5 w-5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.98 8.22A10.5 10.5 0 0 0 1.93 12C3.23 16.34 7.24 19.5 12 19.5c.99 0 1.95-.14 2.86-.39M6.23 6.23A10.45 10.45 0 0 1 12 4.5c4.76 0 8.77 3.16 10.07 7.5a10.52 10.52 0 0 1-4.3 5.27M6.23 6.23 3 3m3.23 3.23 3.65 3.65m7.89 7.89L21 21m-3.23-3.23-3.65-3.65m0 0a3 3 0 1 0-4.24-4.24m4.24 4.24L9.88 9.88"
          />
        </svg>
        <svg
          v-else
          class="h-5 w-5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M1.93 12C3.23 7.66 7.24 4.5 12 4.5s8.77 3.16 10.07 7.5c-1.3 4.34-5.31 7.5-10.07 7.5S3.23 16.34 1.93 12Z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      </button>
    </div>

    <p
      v-if="error"
      :id="errorId"
      class="text-xs font-medium text-red-500"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
