import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/shared/api/api.js'
import { useSnackbar } from '@/shared/lib/composables/useSnackbar.js'
import { navigateToProfile } from '@/shared/lib/navigation/navigateToProfile.js'
import { useAuthStore } from '@/features/auth/model/auth.store.js'
import { normalizeContactsToLinks } from '@/features/profile/lib/contactLinks.js'
import {
  normalizeConversationMessage,
  normalizeConversationSummary,
} from '@/features/signals/model/normalizeConversation.js'

export function useSendSignals () {
  const router = useRouter()
  const authStore = useAuthStore()

  const signals = ref([])
  const dialog = ref(false)
  const activeSignal = ref(null)
  const messages = ref([])
  const loadingConversation = ref(false)
  const shareLoading = ref(false)
  const hideLoading = ref(false)
  const closeLoading = ref(false)
  const sharedContacts = ref([])
  const sharedContactsLoading = ref(false)
  const { showToast, snackbar } = useSnackbar()

  const currentUserId = computed(() => authStore.user?.id || null)
  const canHide = computed(() => activeSignal.value?.status === 'closed')
  const canCloseConversation = computed(() => activeSignal.value?.status === 'open')

  async function fetchSignals () {
    try {
      const res = await api.get('/conversations/sent')
      const conversations = (res.data.conversations || []).map(item => normalizeConversationSummary(item, 'sent'))

      signals.value = conversations

      if (activeSignal.value) {
        const refreshed = conversations.find(item => item.id === activeSignal.value.id)
        if (refreshed) {
          activeSignal.value = refreshed
        }
      }
    } catch (error) {
      console.error(error)
      showToast('Failed to load signals', 'error')
    }
  }

  async function fetchMessages (conversationId) {
    loadingConversation.value = true

    try {
      const res = await api.get(`/conversations/${conversationId}/messages`)
      messages.value = (res.data.messages || []).map(normalizeConversationMessage)
    } catch (error) {
      console.error(error)
      showToast('Failed to load conversation', 'error')
    } finally {
      loadingConversation.value = false
    }
  }

  async function openDialog (signal) {
    activeSignal.value = signal
    sharedContacts.value = []
    dialog.value = true
    await fetchMessages(signal.id)
  }

  function closeDialog () {
    dialog.value = false
    activeSignal.value = null
    messages.value = []
    sharedContacts.value = []
  }

  async function fetchSharedContacts () {
    if (!activeSignal.value?.contactInfoSharedWithMe) {
      sharedContacts.value = []
      return
    }

    sharedContactsLoading.value = true

    try {
      const res = await api.get(`/conversations/${activeSignal.value.id}/contacts`)
      sharedContacts.value = normalizeContactsToLinks(res.data.contacts || [])
    } catch (error) {
      console.error(error)
      showToast('Failed to load shared contacts', 'error')
    } finally {
      sharedContactsLoading.value = false
    }
  }

  async function shareContactInfo (visible) {
    if (!activeSignal.value) {
      return
    }

    shareLoading.value = true

    try {
      await api.put(`/conversations/${activeSignal.value.id}/contact-sharing`, { visible })
      activeSignal.value = {
        ...activeSignal.value,
        ownContactsShared: visible,
      }
      signals.value = signals.value.map(item => item.id === activeSignal.value.id
        ? { ...item, ownContactsShared: visible }
        : item)

      showToast(visible ? 'Your contacts are now shared' : 'Your contacts are hidden again', 'success')
    } catch (error) {
      console.error(error)
      showToast('Failed to update contact sharing', 'error')
    } finally {
      shareLoading.value = false
    }
  }

  async function closeConversation () {
    if (!activeSignal.value) {
      return
    }

    closeLoading.value = true

    try {
      await api.patch(`/conversations/${activeSignal.value.id}/close`, {
        outcome: 'success',
      })

      await fetchSignals()
      const refreshed = signals.value.find(item => item.id === activeSignal.value.id)
      activeSignal.value = refreshed || {
        ...activeSignal.value,
        status: 'closed',
        outcome: 'success',
      }

      showToast('Dialog closed', 'success')
    } catch (error) {
      console.error(error)
      showToast('Failed to close dialog', 'error')
    } finally {
      closeLoading.value = false
    }
  }

  async function hideConversation () {
    if (!activeSignal.value) {
      return
    }

    hideLoading.value = true

    try {
      await api.patch(`/conversations/${activeSignal.value.id}/hide`)
      closeDialog()
      await fetchSignals()
      showToast('Dialog hidden from your list', 'success')
    } catch (error) {
      console.error(error)
      showToast('Failed to hide dialog', 'error')
    } finally {
      hideLoading.value = false
    }
  }

  function goToProfile (id) {
    navigateToProfile(router, id)
  }

  function reportSignal () {
    showToast('Report will be available soon', 'info')
  }

  onMounted(fetchSignals)

  return {
    activeSignal,
    canCloseConversation,
    canHide,
    closeConversation,
    closeDialog,
    closeLoading,
    currentUserId,
    dialog,
    fetchSharedContacts,
    goToProfile,
    hideConversation,
    hideLoading,
    loadingConversation,
    messages,
    openDialog,
    reportSignal,
    shareContactInfo,
    shareLoading,
    sharedContacts,
    sharedContactsLoading,
    signals,
    snackbar,
  }
}
