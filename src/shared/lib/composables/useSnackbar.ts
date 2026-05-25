import { ref } from 'vue'

type SnackbarColor = 'success' | 'error' | 'warning' | 'info' | string

interface SnackbarState {
  show: boolean
  text: string
  color: SnackbarColor
}

export function useSnackbar () {
  const snackbar = ref<SnackbarState>({
    show: false,
    text: '',
    color: 'success',
  })

  function showToast (text: string, color: SnackbarColor = 'success') {
    snackbar.value.text = text
    snackbar.value.color = color
    snackbar.value.show = true
  }

  return {
    showToast,
    snackbar,
  }
}
