import { ref } from 'vue'
import { extractErrorMessage } from '@/api/axios'
import { userService } from '@/api/user.service'
import type { GetUserResponseDto } from '@/types/user.types'

export function useUser() {
  const user = ref<GetUserResponseDto | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUser(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      user.value = await userService.getCurrentUser()
    } catch (err) {
      error.value = extractErrorMessage(err)
    } finally {
      isLoading.value = false
    }
  }

  return { user, isLoading, error, fetchUser }
}
