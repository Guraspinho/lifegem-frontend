<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import AuthInput from './AuthInput.vue'
import AuthSubmitButton from './AuthSubmitButton.vue'
import { useAuth } from '@/composables/useAuth'
import { AUTH_LIMITS } from '@/types/auth.types'
import {
  hasMaxLength,
  hasMinLength,
  isRequired,
  isValidEmail,
} from '@/utils/validators'

const { register, isLoading, error, resetError } = useAuth()

// Drop any stale error carried over from another auth screen.
onMounted(resetError)

type Field = 'email' | 'name' | 'surname' | 'password'

const form = reactive<Record<Field, string>>({
  email: '',
  name: '',
  surname: '',
  password: '',
})
const errors = reactive<Record<Field, string | null>>({
  email: null,
  name: null,
  surname: null,
  password: null,
})

const submitted = ref(false)

function validateField(field: Field): void {
  const value = form[field]
  switch (field) {
    case 'email':
      if (!isRequired(value)) errors.email = 'Email is required.'
      else if (!isValidEmail(value))
        errors.email = 'Enter a valid email address.'
      else errors.email = null
      break
    case 'name':
      if (!isRequired(value)) errors.name = 'Name is required.'
      else if (!hasMaxLength(value, AUTH_LIMITS.name))
        errors.name = `Name must be at most ${AUTH_LIMITS.name} characters.`
      else errors.name = null
      break
    case 'surname':
      if (!isRequired(value)) errors.surname = 'Surname is required.'
      else if (!hasMaxLength(value, AUTH_LIMITS.surname))
        errors.surname = `Surname must be at most ${AUTH_LIMITS.surname} characters.`
      else errors.surname = null
      break
    case 'password':
      if (!isRequired(value)) errors.password = 'Password is required.'
      else if (!hasMinLength(value, AUTH_LIMITS.passwordMin))
        errors.password = `Password must be at least ${AUTH_LIMITS.passwordMin} characters.`
      else if (!hasMaxLength(value, AUTH_LIMITS.passwordMax))
        errors.password = `Password must be at most ${AUTH_LIMITS.passwordMax} characters.`
      else errors.password = null
      break
  }
}

function validate(): boolean {
  ;(['email', 'name', 'surname', 'password'] as Field[]).forEach(validateField)
  return !errors.email && !errors.name && !errors.surname && !errors.password
}

function onBlur(field: Field): void {
  if (submitted.value) validateField(field)
}

async function onSubmit(): Promise<void> {
  submitted.value = true
  if (!validate()) return
  try {
    await register({
      email: form.email.trim(),
      name: form.name.trim(),
      surname: form.surname.trim(),
      password: form.password,
    })
  } catch {
    // Server-side error is surfaced via the `error` ref below.
  }
}
</script>

<template>
  <form novalidate class="space-y-5" @submit.prevent="onSubmit">
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

    <div class="grid gap-5 sm:grid-cols-2">
      <AuthInput
        v-model="form.name"
        label="Name"
        autocomplete="given-name"
        placeholder="Jane"
        :maxlength="AUTH_LIMITS.name"
        :error="errors.name"
        :disabled="isLoading"
        required
        @blur="onBlur('name')"
      />
      <AuthInput
        v-model="form.surname"
        label="Surname"
        autocomplete="family-name"
        placeholder="Doe"
        :maxlength="AUTH_LIMITS.surname"
        :error="errors.surname"
        :disabled="isLoading"
        required
        @blur="onBlur('surname')"
      />
    </div>

    <AuthInput
      v-model="form.password"
      label="Password"
      type="password"
      autocomplete="new-password"
      placeholder="8–32 characters"
      :maxlength="AUTH_LIMITS.passwordMax"
      :error="errors.password"
      :disabled="isLoading"
      required
      @blur="onBlur('password')"
    />

    <AuthSubmitButton
      label="Create Account"
      loading-label="Creating account…"
      :loading="isLoading"
    />
  </form>
</template>
