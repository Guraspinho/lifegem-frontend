<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import AuthCard from '@/components/auth/AuthCard.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
</script>

<template>
  <AuthLayout>
    <AuthCard title="Welcome back" subtitle="Log in to your LifeGem account">
      <LoginForm />

      <template #footer>
        <span class="text-slate-500 dark:text-slate-400">
          Don't have an account?
        </span>
        <RouterLink
          :to="{ name: 'register' }"
          class="ml-1 font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
        >
          Sign up
        </RouterLink>
      </template>
    </AuthCard>
  </AuthLayout>
</template>
