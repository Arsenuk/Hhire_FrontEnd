import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/shared/api/api'
import { useSnackbar } from '@/shared/lib/composables/useSnackbar'
import { navigateToProfile } from '@/shared/lib/navigation/navigateToProfile'
import { useAuthStore } from '@/features/auth/model/auth.store'
import { normalizeContactsToLinks } from '@/features/profile/lib/contactLinks'
import {
  normalizeConversationMessage,
  normalizeConversationSummary,
} from '@/features/signals/model/normalizeConversation'
import type {
  ConversationContactsDto,
  ConversationMessageDto,
  ConversationMessageVm,
  ConversationSummaryDto,
  ConversationSummaryVm,
  ConversationView,
} from '@/features/signals/model/conversation.types'
import type { ContactLink, EntityId } from '@/shared/types'

type ContactLinkView = ContactLink & {
  description?: string
}

type ConversationsResponse = {
  conversations?: ConversationSummaryDto[]
}

type MessagesResponse = {
  messages?: ConversationMessageDto[]
}

type ContactsResponse = {
  contacts?: ConversationContactsDto[]
}

type ReportPayload = {
  onDone?: () => void
  tags?: string | string[]
}

type UseSignalsConversationOptions = {
  listEndpoint: string
  view: ConversationView
  onSignalsUpdated?: (signals: ConversationSummaryVm[]) => void
}

export function useSignalsConversation ({
  listEndpoint,
  view,
  onSignalsUpdated,
}: UseSignalsConversationOptions) {
  const router = useRouter()
  const authStore = useAuthStore()
  const { showToast, snackbar } = useSnackbar()

  const signals = ref<ConversationSummaryVm[]>([])
  const dialog = ref(false)
  const activeSignal = ref<ConversationSummaryVm | null>(null)
  const messages = ref<ConversationMessageVm[]>([])
  const loadingConversation = ref(false)
  const shareLoading = ref(false)
  const hideLoading = ref(false)
  const closeLoading = ref(false)
  const reportLoading = ref(false)
  const sharedContacts = ref<ContactLinkView[]>([])
  const sharedContactsLoading = ref(false)

  const currentUserId = computed(() => authStore.user?.id || null)
  const canHide = computed(() => activeSignal.value?.status === 'closed')
  const canCloseConversation = computed(() => activeSignal.value?.status === 'open')
  const isAwaitingMyCloseConfirmation = computed(() => Boolean(
    activeSignal.value?.status === 'open' &&
    activeSignal.value?.closeRequestedByCounterparty,
  ))

  async function fetchSignals (): Promise<void> {
    try {
      const res = await api.get<ConversationsResponse>(listEndpoint)
      const conversations = (res.data.conversations ?? []).map(item => normalizeConversationSummary(item, view))

      signals.value = conversations
      onSignalsUpdated?.(conversations)

      if (!activeSignal.value) {
        return
      }

      const refreshed = conversations.find(item => item.id === activeSignal.value?.id)
      if (refreshed) {
        activeSignal.value = refreshed
      }
    } catch (error) {
      console.error(error)
      showToast('Failed to load signals', 'error')
    }
  }

  async function fetchMessages (conversationId: EntityId | null | undefined): Promise<void> {
    if (!conversationId) {
      messages.value = []
      return
    }

    loadingConversation.value = true

    try {
      const res = await api.get<MessagesResponse>(`/conversations/${conversationId}/messages`)
      messages.value = (res.data.messages ?? []).map(normalizeConversationMessage)
    } catch (error) {
      console.error(error)
      showToast('Failed to load conversation', 'error')
    } finally {
      loadingConversation.value = false
    }
  }

  async function openDialog (signal: ConversationSummaryVm): Promise<void> {
    activeSignal.value = signal
    sharedContacts.value = []
    dialog.value = true
    await fetchMessages(signal.id)
  }

  function closeDialog (): void {
    dialog.value = false
    activeSignal.value = null
    messages.value = []
    sharedContacts.value = []
  }

  async function fetchSharedContacts (): Promise<void> {
    if (!activeSignal.value?.contactInfoSharedWithMe || !activeSignal.value.id) {
      sharedContacts.value = []
      return
    }

    sharedContactsLoading.value = true

    try {
      const res = await api.get<ContactsResponse>(`/conversations/${activeSignal.value.id}/contacts`)
      sharedContacts.value = normalizeContactsToLinks(res.data.contacts ?? []) as ContactLinkView[]
    } catch (error) {
      console.error(error)
      showToast('Failed to load shared contacts', 'error')
    } finally {
      sharedContactsLoading.value = false
    }
  }

  async function shareContactInfo (visible: boolean): Promise<void> {
    if (!activeSignal.value?.id) {
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

  async function closeConversation (): Promise<void> {
    if (!activeSignal.value?.id) {
      return
    }

    closeLoading.value = true

    try {
      await api.patch(`/conversations/${activeSignal.value.id}/close`, {
        outcome: 'success',
      })

      const currentId = activeSignal.value.id
      await fetchSignals()

      const refreshed = signals.value.find(item => item.id === currentId)
      activeSignal.value = refreshed ?? {
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

  async function hideConversation (): Promise<void> {
    if (!activeSignal.value?.id) {
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

  async function reportSignal ({ tags, onDone }: ReportPayload = {}): Promise<void> {
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

  function goToProfile (id: EntityId | null | undefined): ReturnType<typeof navigateToProfile> {
    return navigateToProfile(router, id)
  }

  return {
    activeSignal,
    canCloseConversation,
    canHide,
    closeConversation,
    closeDialog,
    closeLoading,
    currentUserId,
    dialog,
    fetchMessages,
    fetchSharedContacts,
    fetchSignals,
    goToProfile,
    hideConversation,
    hideLoading,
    isAwaitingMyCloseConfirmation,
    loadingConversation,
    messages,
    openDialog,
    reportLoading,
    reportSignal,
    shareContactInfo,
    shareLoading,
    sharedContacts,
    sharedContactsLoading,
    showToast,
    signals,
    snackbar,
  }
}
