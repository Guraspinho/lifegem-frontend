<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import AuthInput from './AuthInput.vue'
import AuthSubmitButton from './AuthSubmitButton.vue'
import { useAuth } from '@/composables/useAuth'
import { AUTH_LIMITS } from '@/types/auth.types'
import { hasMinLength, isRequired, isValidEmail } from '@/utils/validators'

const { login, isLoading, error, resetError } = useAuth()
const route = useRoute()

// Show a success notice when arriving here right after registering.
const justRegistered = ref(route.query.registered === '1')

// Drop any stale error carried over from another auth screen.
onMounted(resetError)

const form = reactive({ email: '', password: '' })
const errors = reactive<{ email: string | null; password: string | null }>({
  email: null,
  password: null,
})

// Only surface field errors after the first submit attempt, then live-validate.
const submitted = ref(false)

function validateField(field: 'email' | 'password'): void {
  if (field === 'email') {
    if (!isRequired(form.email)) errors.email = 'Email is required.'
    else if (!isValidEmail(form.email))
      errors.email = 'Enter a valid email address.'
    else errors.email = null
  } else {
    if (!isRequired(form.password)) errors.password = 'Password is required.'
    else if (!hasMinLength(form.password, AUTH_LIMITS.passwordMin))
      errors.password = `Password must be at least ${AUTH_LIMITS.passwordMin} characters.`
    else errors.password = null
  }
}

function validate(): boolean {
  validateField('email')
  validateField('password')
  return !errors.email && !errors.password
}

function onBlur(field: 'email' | 'password'): void {
  if (submitted.value) validateField(field)
}

async function onSubmit(): Promise<void> {
  submitted.value = true
  justRegistered.value = false
  if (!validate()) return
  try {
    await login({ email: form.email.trim(), password: form.password })
  } catch {
    // Server-side error is surfaced via the `error` ref below.
  }
}
</script>

<template>
  <form novalidate class="space-y-5" @submit.prevent="onSubmit">
    <!-- Post-registration success banner -->
    <p
      v-if="justRegistered"
      class="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
      role="status"
    >
      Account created successfully. Please log in.
    </p>

    <!-- Server error banner -->
    <p
      v-if="error"
      class="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400"
      role="alert"
    >
      {{ error }}
    </p>

    <AuthInput
      v-model="form.email"
      label="Email"
      type="email"
      autocomplete="email"
      placeholder="you@example.com"
      :error="errors.email"
      :disabled="isLoading"
      required
      @blur="onBlur('email')"
    />

    <AuthInput
      v-model="form.password"
      label="Password"
      type="password"
      autocomplete="current-password"
      placeholder="••••••••"
      :maxlength="AUTH_LIMITS.passwordMax"
      :error="errors.password"
      :disabled="isLoading"
      required
      @blur="onBlur('password')"
    />

    <AuthSubmitButton
      label="Log in"
      loading-label="Logging in…"
      :loading="isLoading"
    />
  </form>
</template>
