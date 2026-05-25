import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/shared/api/api'
import { useSnackbar } from '@/shared/lib/composables/useSnackbar'
import { navigateToProfile } from '@/shared/lib/navigation/navigateToProfile'
import { useAuthStore } from '@/features/auth/model/auth.store'
import { normalizeContactsToLinks } from '@/features/profile/lib/contactLinks.js'
import {
  normalizeConversationMessage,
  normalizeConversationSummary,
} from '@/features/signals/model/normalizeConversation'
import type {
  ContactLink,
  ConversationMessage,
  ConversationSummary,
  EntityId,
} from '@/shared/types'

type UpdateNotify = (count: number) => void
type ReplyAction = 'accept' | 'refuse'

type ContactLinkView = ContactLink & {
  description?: string
}

type RespondPayload = {
  action: ReplyAction
  message: string
}

type ReportPayload = {
  onDone?: () => void
  tags?: string | string[]
}

type InboxResponse = {
  conversations?: Record<string, unknown>[]
}

type MessagesResponse = {
  messages?: Record<string, unknown>[]
}

type ContactsResponse = {
  contacts?: Record<string, unknown>[]
}

export function useUnrepliedSignals (updateNotify?: UpdateNotify) {
  const router = useRouter()
  const authStore = useAuthStore()

  const signals = ref<ConversationSummary[]>([])
  const dialog = ref(false)
  const activeSignal = ref<ConversationSummary | null>(null)
  const messages = ref<ConversationMessage[]>([])
  const loadingConversation = ref(false)
  const replyLoading = ref(false)
  const shareLoading = ref(false)
  const hideLoading = ref(false)
  const closeLoading = ref(false)
  const reportLoading = ref(false)
  const sharedContacts = ref<ContactLinkView[]>([])
  const sharedContactsLoading = ref(false)
  const { showToast, snackbar } = useSnackbar()

  let intervalId: ReturnType<typeof setInterval> | null = null

  const currentUserId = computed(() => authStore.user?.id || null)
  const canReply = computed(() => activeSignal.value?.status === 'open')
  const canHide = computed(() => activeSignal.value?.status === 'closed')
  const canCloseConversation = computed(() => activeSignal.value?.status === 'open')
  const isAwaitingMyCloseConfirmation = computed(() => Boolean(
    activeSignal.value?.status === 'open' &&
    activeSignal.value?.closeRequestedByCounterparty,
  ))

  async function fetchSignals () {
    try {
      const res = await api.get<InboxResponse>('/conversations/inbox')
      const conversations = (res.data.conversations || []).map(item => normalizeConversationSummary(item, 'inbox'))

      signals.value = conversations

      if (updateNotify) {
        updateNotify(conversations.filter(item => item.status === 'open').length)
      }

      if (activeSignal.value) {
        const refreshed = conversations.find(item => item.id === activeSignal.value?.id)
        if (refreshed) {
          activeSignal.value = refreshed
        }
      }
    } catch (error) {
      console.error(error)
      showToast('Failed to load signals', 'error')
    }
  }

  async function fetchMessages (conversationId: EntityId | null | undefined) {
    if (!conversationId) {
      messages.value = []
      return
    }

    loadingConversation.value = true

    try {
      const res = await api.get<MessagesResponse>(`/conversations/${conversationId}/messages`)
      messages.value = (res.data.messages || []).map(normalizeConversationMessage)
    } catch (error) {
      console.error(error)
      showToast('Failed to load conversation', 'error')
    } finally {
      loadingConversation.value = false
    }
  }

  async function openDialog (signal: ConversationSummary) {
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
      const res = await api.get<ContactsResponse>(`/conversations/${activeSignal.value.id}/contacts`)
      sharedContacts.value = normalizeContactsToLinks(res.data.contacts || []) as ContactLinkView[]
    } catch (error) {
      console.error(error)
      showToast('Failed to load shared contacts', 'error')
    } finally {
      sharedContactsLoading.value = false
    }
  }

  async function respond ({ action, message }: RespondPayload) {
    if (!message?.trim()) {
      showToast('Please enter a reply message', 'warning')
      return
    }

    if (!activeSignal.value) {
      return
    }

    replyLoading.value = true

    try {
      await api.post(`/signals/${activeSignal.value.messageId}/reply`, {
        message,
        closeConversation: action === 'refuse',
        outcome: action === 'refuse' ? 'rejected' : undefined,
      })

      if (action === 'accept') {
        await api.post('/follows', {
          targetId: activeSignal.value.counterpart.id,
          targetType: 'user',
        })
      }

      closeDialog()
      await fetchSignals()
      showToast(action === 'refuse' ? 'Dialog closed' : 'Reply sent successfully', 'success')
    } catch (error) {
      console.error(error)
      showToast('Failed to send reply', 'error')
    } finally {
      replyLoading.value = false
    }
  }

  async function shareContactInfo (visible: boolean) {
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
      signals.value = signals.value.map(item => item.id === activeSignal.value?.id
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
      const currentId = activeSignal.value.id
      const refreshed = signals.value.find(item => item.id === currentId)
      activeSignal.value = refreshed || {
        ...activeSignal.value,
        status: 'closed',
        outcome: 'success',
      }

      showToast(
        refreshed?.status === 'closed'
          ? 'Dialog closed after both confirmations'
          : 'Finish request sent. Waiting for the other side to confirm',
        'success',
      )
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

  async function reportSignal ({ tags, onDone }: ReportPayload = {}) {
    if (!activeSignal.value?.messageId) {
      showToast('Failed to prepare report', 'error')
      return
    }

    const selectedTags = Array.isArray(tags)
      ? tags.filter(Boolean)
      : [tags].filter(Boolean)

    if (!selectedTags.length) {
      showToast('Please choose at least one reason', 'warning')
      return
    }

    reportLoading.value = true

    try {
      await api.post('/reports', {
        targetType: 'message',
        targetId: activeSignal.value.messageId,
        tags: selectedTags,
      })

      onDone?.()
      showToast('Report sent to moderation', 'success')
    } catch (error) {
      console.error(error)
      showToast('Failed to send report', 'error')
    } finally {
      reportLoading.value = false
    }
  }

  function goToProfile (id: EntityId | null | undefined) {
    return navigateToProfile(router, id)
  }

  onMounted(() => {
    void fetchSignals()
    intervalId = setInterval(() => {
      void fetchSignals()
    }, 7000)
  })

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId)
    }
  })

  return {
    activeSignal,
    canCloseConversation,
    canHide,
    isAwaitingMyCloseConfirmation,
    canReply,
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
    replyLoading,
    reportLoading,
    reportSignal,
    respond,
    shareContactInfo,
    shareLoading,
    sharedContacts,
    sharedContactsLoading,
    signals,
    snackbar,
  }
}
