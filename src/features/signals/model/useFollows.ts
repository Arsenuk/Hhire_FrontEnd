import { onMounted, ref } from 'vue'
import { normalizeUsers } from '@/entities/user/lib/normalizeUser'
import { useRouter } from 'vue-router'
import { api } from '@/shared/api/api'
import { navigateToProfile } from '@/shared/lib/navigation/navigateToProfile'
import type { EntityId, User } from '@/shared/types'

export function useFollows () {
  const router = useRouter()
  const users = ref<User[]>([])

  async function fetchFollows () {
    try {
      const res = await api.get<{ following?: Record<string, unknown>[] }>('/follows/following')
      users.value = normalizeUsers(res.data.following || [])
    } catch (error) {
      console.error('Failed to load following users', error)
    }
  }

  function goToProfile (id: EntityId | null | undefined) {
    navigateToProfile(router, id)
  }

  function formatDate (date: string | number | Date | null | undefined) {
    if (!date) {
      return ''
    }

    return new Date(date).toLocaleDateString()
  }

  onMounted(() => {
    void fetchFollows()
  })

  return {
    formatDate,
    goToProfile,
    users,
  }
}
