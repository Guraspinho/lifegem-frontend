import { apiClient } from './axios'
import type {
  GetUserResponseDto,
  GetUserSessionsParams,
  GetUserSessionsResponse,
  UserSessionDetail,
} from '@/types/user.types'

export const userService = {
  getCurrentUser(): Promise<GetUserResponseDto> {
    return apiClient.get<GetUserResponseDto>('/user').then((res) => res.data)
  },

  getUserSessions(
    params: GetUserSessionsParams = {},
  ): Promise<GetUserSessionsResponse> {
    return apiClient
      .get<GetUserSessionsResponse>('/user/sessions', { params })
      .then((res) => res.data)
  },

  getUserSession(id: number): Promise<UserSessionDetail> {
    return apiClient
      .get<UserSessionDetail>(`/user/sessions/${id}`)
      .then((res) => res.data)
  },
}
