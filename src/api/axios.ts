import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'
import type { RefreshResponseDto } from '@/types/auth.types'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'

let accessToken: string | null = null
export const setAccessToken = (token: string | null): void => {
  accessToken = token
}
export const getAccessToken = (): string | null => accessToken

type AuthErrorHandler = () => void
let onAuthError: AuthErrorHandler = () => {}
export const setAuthErrorHandler = (handler: AuthErrorHandler): void => {
  onAuthError = handler
}

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

const refreshClient = axios.create({ baseURL, withCredentials: true })

let refreshing: Promise<string> | null = null

const refreshAccessToken = (): Promise<string> => {
  if (!refreshing) {
    refreshing = refreshClient
      .post<RefreshResponseDto>('/auth/refresh')
      .then((res) => {
        setAccessToken(res.data.accessToken)
        return res.data.accessToken
      })
      .finally(() => {
        refreshing = null
      })
  }
  return refreshing
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    const status = error.response?.status

    const isAuthRoute =
      original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/register') ||
      original?.url?.includes('/auth/refresh')

    if (status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true
      try {
        const token = await refreshAccessToken()
        original.headers.Authorization = `Bearer ${token}`
        return apiClient(original)
      } catch (refreshError) {
        setAccessToken(null)
        onAuthError()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

interface BackendErrorEnvelope {
  statusCode?: number
  error?: string | { message?: string | string[] }
  message?: string | string[]
}

const firstMessage = (value: string | string[] | undefined): string | null => {
  if (Array.isArray(value)) return value[0] ?? null
  if (typeof value === 'string' && value.length > 0) return value
  return null
}

export const extractErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as BackendErrorEnvelope | undefined

    if (typeof data?.error === 'string') return data.error
    if (data?.error && typeof data.error === 'object') {
      const nested = firstMessage(data.error.message)
      if (nested) return nested
    }

    const top = firstMessage(data?.message)
    if (top) return top

    if (!error.response) {
      return 'Unable to reach the server. Check your connection and try again.'
    }
  }
  return fallback
}
