import { onMounted, ref } from 'vue'
import { normalizeUsers } from '@/entities/user/lib/normalizeUser'
import { useRouter } from 'vue-router'
import { api } from '@/shared/api/api'
import { useSnackbar } from '@/shared/lib/composables/useSnackbar.js'
import { navigateToProfile } from '@/shared/lib/navigation/navigateToProfile'
import { useAuthStore } from '@/features/auth/model/auth.store'

export function useSuggestedUsers () {
  const auth = useAuthStore()
  const router = useRouter()

  const suggestedUsers = ref([])
  const dialog = ref(false)
  const selectedUser = ref(null)
  const message = ref('')
  const { showToast, snackbar } = useSnackbar()

  async function fetchSuggestedUsers () {
    try {
      const res = await api.get('/users')
      suggestedUsers.value = normalizeUsers(res.data).filter(user => user.id !== auth.user?.id)
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
    navigateToProfile(router, userId, auth.user?.id)
  }

  onMounted(fetchSuggestedUsers)

  return {
    closeDialog,
    dialog,
    goToProfile,
    message,
    openConnectDialog,
    selectedUser,
    sendSignal,
    snackbar,
    suggestedUsers,
  }
}
