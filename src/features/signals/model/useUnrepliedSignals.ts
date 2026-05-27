import { computed, onMounted, onUnmounted, ref } from 'vue'
import { api } from '@/shared/api/api'
import { useSignalsConversation } from '@/features/signals/model/useSignalsConversation'

type UpdateNotify = (count: number) => void
type ReplyAction = 'accept' | 'refuse'

type RespondPayload = {
  action: ReplyAction
  message: string
}

export function useUnrepliedSignals (updateNotify?: UpdateNotify) {
  const base = useSignalsConversation({
    listEndpoint: '/conversations/inbox',
    view: 'inbox',
    onSignalsUpdated: conversations => {
      updateNotify?.(conversations.filter(item => item.status === 'open').length)
    },
  })

  const replyLoading = ref(false)
  let intervalId: ReturnType<typeof setInterval> | null = null

  const canReply = computed(() => base.activeSignal.value?.status === 'open')

  async function respond ({ action, message }: RespondPayload) {
    if (!message?.trim()) {
      base.showToast('Please enter a reply message', 'warning')
      return
    }

    const activeSignal = base.activeSignal.value

    if (!activeSignal?.messageId) {
      return
    }

    replyLoading.value = true

    try {
      await api.post(`/signals/${activeSignal.messageId}/reply`, {
        message,
        closeConversation: action === 'refuse',
        outcome: action === 'refuse' ? 'rejected' : undefined,
      })

      if (action === 'accept') {
        await api.post('/follows', {
          targetId: activeSignal.counterpart.id,
          targetType: 'user',
        })
      }

      base.closeDialog()
      await base.fetchSignals()
      base.showToast(action === 'refuse' ? 'Dialog closed' : 'Reply sent successfully', 'success')
    } catch (error) {
      console.error(error)
      base.showToast('Failed to send reply', 'error')
    } finally {
      replyLoading.value = false
    }
  }

  onMounted(() => {
    void base.fetchSignals()
    intervalId = setInterval(() => {
      void base.fetchSignals()
    }, 7000)
  })

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId)
    }
  })

  return {
    ...base,
    canReply,
    replyLoading,
    respond,
  }
}
