import { onMounted, type Ref } from 'vue'
import { useSignalsConversation } from '@/features/signals/model/useSignalsConversation'

export function useSendSignals (searchQuery?: Ref<string | undefined>) {
  const base = useSignalsConversation({
    listEndpoint: '/conversations/sent',
    view: 'sent',
    ...(searchQuery ? { searchQuery } : {}),
  })

  onMounted(() => {
    void base.fetchSignals()
  })

  return {
    ...base,
  }
}
