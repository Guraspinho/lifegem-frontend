import { ref } from 'vue'
import { extractErrorMessage } from '@/api/axios'
import { userService } from '@/api/user.service'
import type { UserSessionDetail } from '@/types/user.types'

export function useUserSession() {
  const session = ref<UserSessionDetail | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSession(id: number): Promise<void> {
    isLoading.value = true
    error.value = null
    session.value = null
    try {
      session.value = await userService.getUserSession(id)
    } catch (err) {
      error.value = extractErrorMessage(err)
    } finally {
      isLoading.value = false
    }
  }

  function clear(): void {
    session.value = null
    error.value = null
  }

  return { session, isLoading, error, fetchSession, clear }
}
