import { apiClient } from './axios'
import type {
  LoginRequestDto,
  LoginResponseDto,
  RefreshResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from '@/types/auth.types'

export const authService = {
  login(payload: LoginRequestDto): Promise<LoginResponseDto> {
    return apiClient
      .post<LoginResponseDto>('/auth/login', payload)
      .then((res) => res.data)
  },

  register(payload: RegisterRequestDto): Promise<RegisterResponseDto> {
    return apiClient
      .post<RegisterResponseDto>('/auth/register', payload)
      .then((res) => res.data)
  },

  refresh(): Promise<RefreshResponseDto> {
    return apiClient
      .post<RefreshResponseDto>('/auth/refresh')
      .then((res) => res.data)
  },

  logout(): Promise<void> {
    return apiClient.post('/auth/logout').then(() => undefined)
  },
}
