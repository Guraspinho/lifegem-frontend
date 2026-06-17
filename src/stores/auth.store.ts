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

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const status = ref<AuthStatus>('idle')
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => accessToken.value !== null)
  const isLoading = computed(() => status.value === 'loading')

  function setToken(token: string | null): void {
    accessToken.value = token
    setAccessToken(token)
  }

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

  async function login(payload: LoginRequestDto): Promise<LoginResponseDto> {
    const data = await withStatus(() => authService.login(payload))
    setToken(data.accessToken)
    status.value = 'authenticated'
    return data
  }

  async function register(
    payload: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    const data = await withStatus(() => authService.register(payload))
    status.value = 'idle'
    return data
  }

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

  async function logout(): Promise<void> {
    try {
      await authService.logout()
    } catch {
      void 0
    } finally {
      clear()
    }
  }

  function clear(): void {
    setToken(null)
    status.value = 'idle'
    error.value = null
  }

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
