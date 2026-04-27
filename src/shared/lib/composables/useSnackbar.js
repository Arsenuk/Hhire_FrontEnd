import { ref } from 'vue'

export function useSnackbar() {
  const snackbar = ref({
    show: false,
    text: '',
    color: 'success',
  })

  function showToast(text, color = 'success') {
    snackbar.value.text = text
    snackbar.value.color = color
    snackbar.value.show = true
  }

  return {
    showToast,
    snackbar,
  }
}
