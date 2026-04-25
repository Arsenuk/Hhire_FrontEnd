import { onMounted, ref } from 'vue'
import { api } from '@/api/api.js'

export function useSendSignals () {
  const signals = ref([])
  const snackbar = ref({
    show: false,
    text: '',
    color: 'success',
  })

  function showToast (text, color = 'success') {
    snackbar.value.text = text
    snackbar.value.color = color
    snackbar.value.show = true
  }

  async function fetchSignals () {
    try {
      const res = await api.get('/signals/conversations/sent')
      signals.value = res.data.conversations
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

  function getAvatarUrl (avatar) {
    return avatar || '/assets/default-avatar.png'
  }

  onMounted(fetchSignals)

  return {
    deleteSignal,
    getAvatarUrl,
    signals,
    snackbar,
  }
}
