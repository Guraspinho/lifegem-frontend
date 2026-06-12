<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import AuthCard from '@/components/auth/AuthCard.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
</script>

<template>
  <AuthLayout>
    <AuthCard
      title="Create Account"
      subtitle="Start your journey with LifeGem"
    >
      <RegisterForm />

      <template #footer>
        <span class="text-slate-500 dark:text-slate-400">
          Already have an account?
        </span>
        <RouterLink
          :to="{ name: 'login' }"
          class="ml-1 font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
        >
          Log in
        </RouterLink>
      </template>
    </AuthCard>
  </AuthLayout>
</template>
