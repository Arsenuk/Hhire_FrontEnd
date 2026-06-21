import { computed, ref, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/shared/api/api'
import { useSnackbar } from '@/shared/lib/composables/useSnackbar'
import { navigateToProfile } from '@/shared/lib/navigation/navigateToProfile'
import { useAuthStore } from '@/features/auth/model/auth.store'
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

type SuggestedUsersResponse = {
  users?: UserWithRating[]
}

type UseSuggestedUsersReturn = {
  closeDialog: () => void
  dialog: Ref<boolean>
  goToProfile: (userId: EntityId | null | undefined) => void
  isLoading: Ref<boolean>
  openConnectDialog: (user: UserWithRating) => void
  selectedUser: Ref<UserWithRating | null>
  sendSignal: (message: string) => Promise<void>
  sendLoading: Ref<boolean>
  snackbar: ReturnType<typeof useSnackbar>['snackbar']
  suggestedUsers: Ref<UserWithRating[]>
}

export function useSuggestedUsers (searchQuery?: Ref<string | undefined>) : UseSuggestedUsersReturn {
  const auth = useAuthStore()
  const router = useRouter()

  const suggestedUsers = ref<UserWithRating[]>([])
  const dialog = ref(false)
  const selectedUser = ref<UserWithRating | null>(null)
  const sendLoading = ref(false)
  const isLoading = ref(false)
  const { showToast, snackbar } = useSnackbar()
  let refreshToken = 0
  const searchTerm = computed(() => searchQuery?.value?.trim().toLowerCase() || '')

  async function fetchSuggestedUsers (): Promise<void> {
    const token = ++refreshToken
    const userId = auth.user?.id

    if (!userId) {
      suggestedUsers.value = []
      isLoading.value = false
      return
    }

    isLoading.value = true

    try {
      const res = await api.get<SuggestedUsersResponse>('/recommendations/users', {
        params: { limit: 20 },
      })

      if (token !== refreshToken) {
        return
      }

      suggestedUsers.value = (res.data.users ?? []).filter(user => user.id !== userId)
    } catch (error) {
      console.error(error)
      showToast('Failed to load users', 'error')
    } finally {
      if (token === refreshToken) {
        isLoading.value = false
      }
    }
  }

  const visibleSuggestedUsers = computed(() => {
    const query = searchTerm.value

    if (!query) {
      return suggestedUsers.value
    }

    return suggestedUsers.value.filter(user => {
      const haystack = [
        user.name,
        user.username,
        user.description,
      ]
        .filter((value): value is string => typeof value === 'string')
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  })

  function openConnectDialog (user: UserWithRating): void {
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

  watch(
    () => auth.user?.id,
    () => {
      void fetchSuggestedUsers()
    },
    { immediate: true },
  )

  return {
    closeDialog,
    dialog,
    isLoading,
    goToProfile,
    openConnectDialog,
    selectedUser,
    sendSignal,
    sendLoading,
    snackbar,
    suggestedUsers: visibleSuggestedUsers,
  }
}
