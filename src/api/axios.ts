import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'
import type { RefreshResponseDto } from '@/types/auth.types'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'

/**
 * The access token lives in memory only (never localStorage) to limit the XSS
 * blast radius. The refresh token is an httpOnly cookie the browser attaches
 * automatically because every request sets `withCredentials: true`.
 *
 * The auth store is the source of truth and calls `setAccessToken` to keep
 * this module in sync — that indirection keeps `axios.ts` free of any store
 * import, avoiding a circular dependency.
 */
let accessToken: string | null = null
export const setAccessToken = (token: string | null): void => {
  accessToken = token
}
export const getAccessToken = (): string | null => accessToken

/** Invoked when a refresh attempt fails so the store can reset + redirect. */
type AuthErrorHandler = () => void
let onAuthError: AuthErrorHandler = () => {}
export const setAuthErrorHandler = (handler: AuthErrorHandler): void => {
  onAuthError = handler
}

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true, // send/receive the httpOnly refresh cookie
  headers: { 'Content-Type': 'application/json' },
})

// Attach the bearer token to every outgoing request.
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

/* -------------------------------------------------------------------------- */
/*  Transparent refresh-on-401                                                */
/* -------------------------------------------------------------------------- */

// A bare client (no interceptors) for the refresh call, to avoid recursion.
const refreshClient = axios.create({ baseURL, withCredentials: true })

// A single in-flight refresh promise so concurrent 401s share one refresh call.
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

    // Never try to refresh for the auth endpoints themselves.
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

/** Pull a human-readable message out of an Axios/unknown error. */
export const extractErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined
    const message = data?.message
    if (Array.isArray(message)) return message[0] ?? fallback
    if (typeof message === 'string') return message
  }
  return fallback
}
