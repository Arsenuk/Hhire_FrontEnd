import { ref } from 'vue'
import { forgotPasswordRequest } from '@/features/auth/api/auth.api'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type ApiError = {
  message?: string
  response?: {
    data?: {
      error?: string
    }
  }
}

export function useForgotPassword () {
  const email = ref('')
  const emailError = ref('')
  const formError = ref('')
  const successMessage = ref('')
  const loading = ref(false)

  function validateForm () {
    emailError.value = ''
    formError.value = ''

    const normalizedEmail = email.value.trim()

    if (!normalizedEmail) {
      emailError.value = 'Please enter your email'
      return false
    }

    if (!emailPattern.test(normalizedEmail)) {
      emailError.value = 'Please enter a valid email'
      return false
    }

    return true
  }

  async function submitForm () {
    if (!validateForm()) {
      return
    }

    loading.value = true
    successMessage.value = ''
    formError.value = ''

    try {
      await forgotPasswordRequest({
        email: email.value.trim(),
      })

      successMessage.value = 'If the account exists, we sent password reset instructions to your email.'
      email.value = ''
    } catch (error) {
      const apiError = error as ApiError

      formError.value = apiError.response?.data?.error || apiError.message || 'Failed to send reset email'
    } finally {
      loading.value = false
    }
  }

  return {
    email,
    emailError,
    formError,
    loading,
    successMessage,
    submitForm,
  }
}
