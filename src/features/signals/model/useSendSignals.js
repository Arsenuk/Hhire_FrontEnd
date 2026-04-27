import { onMounted, ref } from 'vue'
import { normalizeUser } from '@/entities/user/lib/normalizeUser.js'
import { api } from '@/shared/api/api.js'
import { useSnackbar } from '@/shared/lib/composables/useSnackbar.js'

export function useSendSignals () {
  const signals = ref([])
  const { showToast, snackbar } = useSnackbar()

  async function fetchSignals () {
    try {
      const res = await api.get('/signals/conversations/sent')
      signals.value = res.data.conversations.map(signal => ({
        ...signal,
        receiver: normalizeUser({
          id: signal.receiver_id,
          name: signal.receiver_name,
          avatar: signal.receiver_avatar,
        }),
      }))
    } catch (error) {
      console.error(error)
      showToast('Failed to load signals', 'error')
    }
  }

  async function deleteSignal (signal) {
    try {
      await api.delete(`/signals/${signal.id}`)
      signals.value = signals.value.filter(item => item.id !== signal.id)
      showToast('Signal deleted', 'success')
    } catch (error) {
      console.error(error)
      showToast('Delete failed', 'error')
    }
  }
  onMounted(fetchSignals)

  return {
    deleteSignal,
    signals,
    snackbar,
  }
}
