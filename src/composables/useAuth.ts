import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import type { LoginRequestDto, RegisterRequestDto } from '@/types/auth.types'

export function useAuth() {
  const store = useAuthStore()
  const router = useRouter()
  const { isAuthenticated, isLoading, error, status } = storeToRefs(store)

  async function login(payload: LoginRequestDto): Promise<void> {
    await store.login(payload)
    await redirectAfterAuth()
  }

  async function register(payload: RegisterRequestDto): Promise<void> {
    await store.register(payload)
    await router.push({ name: 'login', query: { registered: '1' } })
  }

  async function logout(): Promise<void> {
    await store.logout()
    await router.push({ name: 'login' })
  }

  async function redirectAfterAuth(): Promise<void> {
    const redirect = router.currentRoute.value.query.redirect
    const target = typeof redirect === 'string' ? redirect : '/'
    await router.push(target)
  }

  return {
    isAuthenticated,
    isLoading,
    error,
    status,
    login,
    register,
    logout,
    resetError: store.resetError,
  }
}
