import { onMounted } from 'vue'
import { useSignalsConversation } from '@/features/signals/model/useSignalsConversation'

export function useSendSignals () {
  const base = useSignalsConversation({
    listEndpoint: '/conversations/sent',
    view: 'sent',
  })

  onMounted(() => {
    void base.fetchSignals()
  })

  return {
    ...base,
  }
}
