import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authService } from '@/api/auth.service'
import { extractErrorMessage, setAccessToken } from '@/api/axios'
import type {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from '@/types/auth.types'

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error'

/**
 * Source of truth for authentication. Keeps the access token in reactive
 * state (in memory) and mirrors it into the axios layer via `setAccessToken`.
 * The refresh token is an httpOnly cookie, so it is intentionally absent here.
 */
export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const status = ref<AuthStatus>('idle')
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => accessToken.value !== null)
  const isLoading = computed(() => status.value === 'loading')

  /** Update both the reactive token and the axios in-memory token together. */
  function setToken(token: string | null): void {
    accessToken.value = token
    setAccessToken(token)
  }

  /** Shared loading/error lifecycle wrapper around an auth request. */
  async function withStatus<T>(request: () => Promise<T>): Promise<T> {
    status.value = 'loading'
    error.value = null
    try {
      return await request()
    } catch (err) {
      error.value = extractErrorMessage(err)
      status.value = 'error'
      throw err
    }
  }

  /** Authenticate: stores the access token and marks the session active. */
  async function login(payload: LoginRequestDto): Promise<LoginResponseDto> {
    const data = await withStatus(() => authService.login(payload))
    setToken(data.accessToken)
    status.value = 'authenticated'
    return data
  }

  /**
   * Create an account. The backend returns the new user but no token, so this
   * does NOT authenticate — the caller should send the user to log in.
   */
  async function register(
    payload: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    const data = await withStatus(() => authService.register(payload))
    status.value = 'idle'
    return data
  }

  /**
   * Restore a session on app boot using the refresh cookie. Returns whether a
   * session was recovered; callers can ignore failures (= not logged in).
   */
  async function restoreSession(): Promise<boolean> {
    try {
      const data = await authService.refresh()
      setToken(data.accessToken)
      status.value = 'authenticated'
      return true
    } catch {
      setToken(null)
      status.value = 'idle'
      return false
    }
  }

  /**
   * Log out: revoke the session server-side (clears the refresh cookie), then
   * drop local auth state. The server call is best-effort — even if it fails
   * (network down, token already expired) we still clear locally so the user
   * is never stuck "logged in" on the client.
   */
  async function logout(): Promise<void> {
    try {
      await authService.logout()
    } catch {
      // Ignore: clearing local state below is what actually logs the user out.
    } finally {
      clear()
    }
  }

  /** Clear local auth state. Called manually or by the axios error handler. */
  function clear(): void {
    setToken(null)
    status.value = 'idle'
    error.value = null
  }

  /** Dismiss a stale error (e.g. when navigating between auth screens). */
  function resetError(): void {
    error.value = null
  }

  return {
    accessToken,
    status,
    error,
    isAuthenticated,
    isLoading,
    login,
    register,
    restoreSession,
    logout,
    clear,
    resetError,
  }
})
