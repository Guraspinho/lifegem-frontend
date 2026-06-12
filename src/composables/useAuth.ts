import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import type { LoginRequestDto, RegisterRequestDto } from '@/types/auth.types'

/**
 * View-facing auth API. Wraps the store with router navigation so components
 * stay free of store/router wiring and just call `login()` / `register()`.
 */
export function useAuth() {
  const store = useAuthStore()
  const router = useRouter()
  const { isAuthenticated, isLoading, error, status } = storeToRefs(store)

  async function login(payload: LoginRequestDto): Promise<void> {
    await store.login(payload)
    await redirectAfterAuth()
  }

  /**
   * Register, then send the user to the login screen with a success flag —
   * the backend creates the account but does not return a session.
   */
  async function register(payload: RegisterRequestDto): Promise<void> {
    await store.register(payload)
    await router.push({ name: 'login', query: { registered: '1' } })
  }

  function logout(): void {
    store.clear()
    void router.push({ name: 'login' })
  }

  /** Send the user to their intended page (?redirect=) or the app home. */
  async function redirectAfterAuth(): Promise<void> {
    const redirect = router.currentRoute.value.query.redirect
    const target = typeof redirect === 'string' ? redirect : '/'
    await router.push(target)
  }

  return {
    // state
    isAuthenticated,
    isLoading,
    error,
    status,
    // actions
    login,
    register,
    logout,
    resetError: store.resetError,
  }
}
