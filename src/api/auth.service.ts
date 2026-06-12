import { apiClient } from './axios'
import type {
  LoginRequestDto,
  LoginResponseDto,
  RefreshResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from '@/types/auth.types'

/**
 * Thin transport layer over the auth endpoints. Components/stores call these
 * instead of touching axios directly, so request shapes stay in one place.
 */
export const authService = {
  login(payload: LoginRequestDto): Promise<LoginResponseDto> {
    return apiClient
      .post<LoginResponseDto>('/auth/login', payload)
      .then((res) => res.data)
  },

  /** Creates the account. Does NOT start a session — the user logs in after. */
  register(payload: RegisterRequestDto): Promise<RegisterResponseDto> {
    return apiClient
      .post<RegisterResponseDto>('/auth/register', payload)
      .then((res) => res.data)
  },

  /** Exchange the httpOnly refresh cookie for a fresh access token. */
  refresh(): Promise<RefreshResponseDto> {
    return apiClient
      .post<RefreshResponseDto>('/auth/refresh')
      .then((res) => res.data)
  },
}
