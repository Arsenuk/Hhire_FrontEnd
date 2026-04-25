import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api/api.js'
import { useAuthStore } from '@/features/auth/model/auth.store.js'

export function useSuggestedUsers () {
  const auth = useAuthStore()
  const router = useRouter()

  const suggestedUsers = ref([])
  const dialog = ref(false)
  const selectedUser = ref(null)
  const message = ref('')
  const snackbar = ref({
    show: false,
    text: '',
    color: 'success',
  })

  function showToast (text, color = 'success') {
    snackbar.value.text = text
    snackbar.value.color = color
    snackbar.value.show = true
  }

  function getAvatarUrl (avatar) {
    return avatar ? `http://localhost:3000${avatar}` : '/assets/default-avatar.png'
  }

  async function fetchSuggestedUsers () {
    try {
      const res = await api.get('/users')
      suggestedUsers.value = res.data.filter(user => user.id !== auth.user.id)
    } catch (error) {
      console.error(error)
      showToast('Failed to load users', 'error')
    }
  }

  function openConnectDialog (user) {
    selectedUser.value = user
    message.value = ''
    dialog.value = true
  }

  function closeDialog () {
    dialog.value = false
  }

  async function sendSignal () {
    if (!message.value.trim()) {
      showToast('Please enter a message', 'warning')
      return
    }

    try {
      await api.post('/signals', {
        sender_type: 'user',
        sender_id: auth.user.id,
        receiver_type: 'user',
        receiver_id: selectedUser.value.id,
        message: message.value,
      })

      dialog.value = false
      showToast('Signal sent successfully', 'success')
    } catch (error) {
      console.error(error)
      showToast('Failed to send signal', 'error')
    }
  }

  function goToProfile (userId) {
    router.push(`/profile/${userId}`)
  }

  onMounted(fetchSuggestedUsers)

  return {
    closeDialog,
    dialog,
    getAvatarUrl,
    goToProfile,
    message,
    openConnectDialog,
    selectedUser,
    sendSignal,
    snackbar,
    suggestedUsers,
  }
}
