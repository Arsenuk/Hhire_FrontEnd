import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { normalizePosts } from '@/entities/post/lib/normalizePost'
import { normalizeUser } from '@/entities/user/lib/normalizeUser'
import { useAuthStore } from '@/features/auth/model/auth.store'
import { normalizeContactsToLinks } from '@/features/profile/lib/contactLinks'
import { canViewProfileRatingBreakdown } from '@/features/profile/lib/canViewProfileRatingBreakdown'
import { normalizeUsefulLinks } from '@/features/profile/lib/usefulLinks'
import type {
  ProfileContactView,
  ProfileLinkView,
  ProfilePostView,
  ProfileRating,
  ProfileUserResponse,
  ProfileUserView,
} from '@/features/profile/model/contracts'
import { api } from '@/shared/api/api'
import { useSnackbar } from '@/shared/lib/composables/useSnackbar'
import type { EntityId } from '@/shared/types'

type FollowStatusResponse = {
  following?: boolean
}

export function useProfileUser () {
  const route = useRoute()
  const authStore = useAuthStore()
  const authUser = computed(() => authStore.user)

  const user = ref<ProfileUserView | null>(null)
  const rating = ref<ProfileRating | null>(null)
  const posts = ref<ProfilePostView[]>([])
  const contacts = ref<ProfileContactView[]>([])
  const links = ref<ProfileLinkView[]>([])
  const errorMessage = ref('')
  const loading = ref(true)

  const isFollowing = ref(false)
  const followLoading = ref(false)
  const contactDialog = ref(false)
  const contactLoading = ref(false)
  const { showToast, snackbar } = useSnackbar()

  function getRouteUserId (): EntityId | null {
    const param = (route.params as Record<string, string | string[] | undefined>).id

    return typeof param === 'string' ? param : null
  }

  const userId = ref<EntityId | null>(getRouteUserId())
  const canManageFollow = computed(() => Boolean(authUser.value && user.value && authUser.value.id !== user.value.id))
  const showRatingBreakdown = computed(() => canViewProfileRatingBreakdown(authUser.value, user.value))
  const canViewContactInfo = computed(() => Boolean(
    user.value && authUser.value && (
      authUser.value.role === 'admin' ||
      authUser.value.id === user.value.id
    )
  ))

  async function loadUserProfile () {
    if (!userId.value) {
      user.value = null
      rating.value = null
      posts.value = []
      contacts.value = []
      links.value = []
      isFollowing.value = false
      errorMessage.value = 'Profile not found'
      loading.value = false
      return
    }

    loading.value = true
    errorMessage.value = ''
    user.value = null
    rating.value = null
    posts.value = []
    contacts.value = []
    links.value = []
    isFollowing.value = false

    try {
      const { data } = await api.get<ProfileUserResponse>(`/users/${userId.value}/profile`)

      user.value = {
        ...normalizeUser(data),
        ...(data.contactInfoVisible !== undefined ? { contactInfoVisible: data.contactInfoVisible } : {}),
      }
      rating.value = data.rating ?? null
      posts.value = normalizePosts(data.posts || [])
      contacts.value = normalizeContactsToLinks(data.contacts || [])
      links.value = normalizeUsefulLinks(data.links || [])

      await checkFollowStatus()
    } catch (error) {
      console.error(error)
      errorMessage.value = 'Failed to load profile'
    } finally {
      loading.value = false
    }
  }

  async function checkFollowStatus () {
    if (!canManageFollow.value) {
      return
    }

    const { data } = await api.get<FollowStatusResponse>('/follows/status', {
      params: {
        targetId: user.value?.id,
        targetType: 'user',
      },
    })

    isFollowing.value = Boolean(data.following)
  }

  async function toggleFollow () {
    if (!user.value) {
      return
    }

    followLoading.value = true

    try {
      if (isFollowing.value) {
        await api.delete('/follows', {
          data: {
            targetId: user.value.id,
            targetType: 'user',
          },
        })
        isFollowing.value = false
      } else {
        await api.post('/follows', {
          targetId: user.value.id,
          targetType: 'user',
        })
        isFollowing.value = true
      }
    } finally {
      followLoading.value = false
    }
  }

  function openContactDialog () {
    contactDialog.value = true
  }

  function closeContactDialog () {
    contactDialog.value = false
  }

  async function sendSignal (message: string) {
    if (!authUser.value || !user.value) {
      showToast('Please log in to send a signal', 'warning')
      return
    }

    const trimmedMessage = message.trim()

    if (!trimmedMessage) {
      showToast('Please enter a message', 'warning')
      return
    }

    contactLoading.value = true

    try {
      await api.post('/signals', {
        sender_type: 'user',
        sender_id: authUser.value.id,
        receiver_type: 'user',
        receiver_id: user.value.id,
        message: trimmedMessage,
      })

      contactDialog.value = false
      showToast('Signal sent successfully', 'success')
    } catch (error) {
      console.error(error)
      showToast('Failed to send signal', 'error')
    } finally {
      contactLoading.value = false
    }
  }

  onMounted(loadUserProfile)

  watch(() => (route.params as Record<string, string | string[] | undefined>).id, () => {
    userId.value = getRouteUserId()
    closeContactDialog()
    void loadUserProfile()
  })

  return {
    canManageFollow,
    canViewContactInfo,
    closeContactDialog,
    contactDialog,
    contactLoading,
    contacts,
    errorMessage,
    followLoading,
    isFollowing,
    links,
    loading,
    openContactDialog,
    posts,
    rating,
    showRatingBreakdown,
    sendSignal,
    snackbar,
    toggleFollow,
    user,
  }
}
