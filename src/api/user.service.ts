import { apiClient } from './axios'
import type { GetUserResponseDto } from '@/types/user.types'

/**
 * Transport layer for user endpoints. Mirrors `authService` — components/
 * composables call these instead of touching axios directly.
 */
export const userService = {
  /** GET /users — the authenticated user's profile and aggregate metrics. */
  getCurrentUser(): Promise<GetUserResponseDto> {
    return apiClient.get<GetUserResponseDto>('/user').then((res) => res.data)
  },
}
