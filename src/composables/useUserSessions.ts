import { computed, ref } from 'vue'
import { extractErrorMessage } from '@/api/axios'
import { userService } from '@/api/user.service'
import type { UserSession } from '@/types/user.types'

export function useUserSessions(pageSize = 5) {
  const sessions = ref<UserSession[]>([])
  const nextCursor = ref<number | null>(null)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  const hasMore = computed(() => nextCursor.value !== null)
  const isEmpty = computed(() => loaded.value && sessions.value.length === 0)

  async function fetchInitial(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const res = await userService.getUserSessions({ limit: pageSize })
      sessions.value = res.sessions
      nextCursor.value = res.nextCursor
      loaded.value = true
    } catch (err) {
      error.value = extractErrorMessage(err)
    } finally {
      isLoading.value = false
    }
  }

  async function loadMore(): Promise<void> {
    if (nextCursor.value === null || isLoadingMore.value) return
    isLoadingMore.value = true
    error.value = null
    try {
      const res = await userService.getUserSessions({
        cursor: nextCursor.value,
        limit: pageSize,
      })
      sessions.value.push(...res.sessions)
      nextCursor.value = res.nextCursor
    } catch (err) {
      error.value = extractErrorMessage(err)
    } finally {
      isLoadingMore.value = false
    }
  }

  return {
    sessions,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    isEmpty,
    loaded,
    fetchInitial,
    loadMore,
  }
}
