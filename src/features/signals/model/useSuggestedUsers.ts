import { onMounted, ref, type Ref } from 'vue'
import { normalizeUsers } from '@/entities/user/lib/normalizeUser'
import { useRouter } from 'vue-router'
import { api } from '@/shared/api/api'
import { useSnackbar } from '@/shared/lib/composables/useSnackbar'
import { navigateToProfile } from '@/shared/lib/navigation/navigateToProfile'
import { useAuthStore } from '@/features/auth/model/auth.store'
import type { EntityId, User } from '@/shared/types'

type UseSuggestedUsersReturn = {
  closeDialog: () => void
  dialog: Ref<boolean>
  goToProfile: (userId: EntityId | null | undefined) => void
  openConnectDialog: (user: User) => void
  selectedUser: Ref<User | null>
  sendSignal: (message: string) => Promise<void>
  sendLoading: Ref<boolean>
  snackbar: ReturnType<typeof useSnackbar>['snackbar']
  suggestedUsers: Ref<User[]>
}

export function useSuggestedUsers (): UseSuggestedUsersReturn {
  const auth = useAuthStore()
  const router = useRouter()

  const suggestedUsers = ref<User[]>([])
  const dialog = ref(false)
  const selectedUser = ref<User | null>(null)
  const sendLoading = ref(false)
  const { showToast, snackbar } = useSnackbar()

  async function fetchSuggestedUsers (): Promise<void> {
    try {
      const res = await api.get<Record<string, unknown>[]>('/users')
      suggestedUsers.value = normalizeUsers(res.data).filter(user => user.id !== auth.user?.id)
    } catch (error) {
      console.error(error)
      showToast('Failed to load users', 'error')
    }
  }

  function openConnectDialog (user: User): void {
    selectedUser.value = user
    dialog.value = true
  }

  function closeDialog (): void {
    dialog.value = false
  }

  async function sendSignal (message: string): Promise<void> {
    const trimmedMessage = message.trim()

    if (!trimmedMessage) {
      showToast('Please enter a message', 'warning')
      return
    }

    if (!auth.user?.id || !selectedUser.value?.id) {
      showToast('Failed to prepare signal', 'error')
      return
    }

    sendLoading.value = true

    try {
      await api.post('/signals', {
        sender_type: 'user',
        sender_id: auth.user.id,
        receiver_type: 'user',
        receiver_id: selectedUser.value.id,
        message: trimmedMessage,
      })

      dialog.value = false
      showToast('Signal sent successfully', 'success')
    } catch (error) {
      console.error(error)
      showToast('Failed to send signal', 'error')
    } finally {
      sendLoading.value = false
    }
  }

  function goToProfile (userId: EntityId | null | undefined): void {
    navigateToProfile(router, userId, auth.user?.id)
  }

  onMounted(() => {
    void fetchSuggestedUsers()
  })

  return {
    closeDialog,
    dialog,
    goToProfile,
    openConnectDialog,
    selectedUser,
    sendSignal,
    sendLoading,
    snackbar,
    suggestedUsers,
  }
}
