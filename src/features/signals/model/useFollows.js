import { onMounted, ref } from 'vue'
import { normalizeUsers } from '@/entities/user/lib/normalizeUser'
import { useRouter } from 'vue-router'
import { api } from '@/shared/api/api'
import { navigateToProfile } from '@/shared/lib/navigation/navigateToProfile'

export function useFollows () {
  const router = useRouter()
  const users = ref([])

  async function fetchFollows () {
    try {
      const res = await api.get('/follows/following')
      users.value = normalizeUsers(res.data.following || [])
    } catch (error) {
      console.error('Failed to load following users', error)
    }
  }

  function goToProfile (id) {
    navigateToProfile(router, id)
  }

  function formatDate (date) {
    return new Date(date).toLocaleDateString()
  }

  onMounted(fetchFollows)

  return {
    formatDate,
    goToProfile,
    users,
  }
}
