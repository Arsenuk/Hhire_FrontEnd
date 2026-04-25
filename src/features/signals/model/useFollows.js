import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api/api.js'

export function useFollows () {
  const router = useRouter()
  const users = ref([])

  const getAvatarUrl = avatar =>
    avatar ? `http://localhost:3000${avatar}` : '/assets/default-avatar.png'

  async function fetchFollows () {
    try {
      const res = await api.get('/follows/following')
      users.value = res.data
    } catch (error) {
      console.error('Failed to load following users', error)
    }
  }

  function goToProfile (id) {
    router.push(`/profile/${id}`)
  }

  function formatDate (date) {
    return new Date(date).toLocaleDateString()
  }

  onMounted(fetchFollows)

  return {
    formatDate,
    getAvatarUrl,
    goToProfile,
    users,
  }
}
