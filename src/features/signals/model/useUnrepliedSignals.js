import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/shared/api/api.js'
import { useSnackbar } from '@/shared/lib/composables/useSnackbar.js'
import { getAvatarUrl } from '@/shared/lib/media/getAvatarUrl.js'
import { navigateToProfile } from '@/shared/lib/navigation/navigateToProfile.js'

export function useUnrepliedSignals (updateNotify) {
  const router = useRouter()

  const signals = ref([])
  const dialog = ref(false)
  const activeSignal = ref(null)
  const replyMessage = ref('')
  const { showToast, snackbar } = useSnackbar()

  let intervalId = null

  async function fetchSignals () {
    try {
      const res = await api.get('/signals/conversations/inbox')
      signals.value = res.data.signals

      if (updateNotify) {
        updateNotify(signals.value.length)
      }
    } catch (error) {
      console.error(error)
      showToast('Failed to load signals', 'error')
    }
  }

  function openDialog (signal) {
    activeSignal.value = signal
    replyMessage.value = ''
    dialog.value = true
  }

  function closeDialog () {
    dialog.value = false
    activeSignal.value = null
  }

  async function respond (type) {
    if (!replyMessage.value.trim()) {
      showToast('Please enter a reply message', 'warning')
      return
    }

    try {
      await api.post(`/signals/${activeSignal.value.id}/reply`, {
        message: replyMessage.value,
      })

      if (type === 'sing') {
        await api.post('/follows', {
          targetId: activeSignal.value.sender_id,
          targetType: 'user',
        })
      }

      closeDialog()
      await fetchSignals()
      showToast('Reply sent successfully', 'success')
    } catch (error) {
      console.error(error)
      showToast('Failed to send reply', 'error')
    }
  }

  function goToProfile (id) {
    navigateToProfile(router, id)
  }

  onMounted(() => {
    fetchSignals()
    intervalId = setInterval(fetchSignals, 7000)
  })

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId)
    }
  })

  return {
    activeSignal,
    closeDialog,
    dialog,
    getAvatarUrl,
    goToProfile,
    openDialog,
    replyMessage,
    respond,
    signals,
    snackbar,
  }
}
