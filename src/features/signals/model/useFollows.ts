import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/shared/api/api'
import { navigateToProfile } from '@/shared/lib/navigation/navigateToProfile'
import type { EntityId, User } from '@/shared/types'

type RatingSummary = {
  value: number
  total: number
  breakdown?: {
    success: number
    rejected: number
    ignored: number
  }
}

type UserWithRating = User & {
  rating?: RatingSummary | null
}

export function useFollows () {
  const router = useRouter()
  const users = ref<UserWithRating[]>([])

  async function fetchFollows () {
    try {
      const res = await api.get<{ following?: Record<string, unknown>[] }>('/follows/following')
      users.value = (res.data.following || []) as UserWithRating[]
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
