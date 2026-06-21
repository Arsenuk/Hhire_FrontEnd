import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/model/auth.store'
import { resetPasswordRequest } from '@/features/auth/api/auth.api'

const passwordPattern = /^\S+$/

type ApiError = {
  message?: string
  response?: {
    data?: {
      error?: string
    }
  }
}

function readQueryValue (value: unknown): string {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  return typeof value === 'string' ? value : ''
}

function resolvePasswordResetError (message: string): string {
  const normalized = message.toLowerCase()

  if (normalized.includes('expired')) {
    return 'Reset link has expired. Please request a new one.'
  }

  if (normalized.includes('invalid')) {
    return 'Reset link is invalid. Please request a new one.'
  }

  if (normalized.includes('used')) {
    return 'Reset link was already used. Please request a new one.'
  }

  return message || 'Failed to reset password'
}

export function useResetPassword () {
  const authStore = useAuthStore()
  const route = useRoute()
  const router = useRouter()

  const password = ref('')
  const confirmPassword = ref('')
  const passwordError = ref('')
  const confirmPasswordError = ref('')
  const formError = ref('')
  const loading = ref(false)

  const token = computed(() => readQueryValue(route.query.token).trim())
  const tokenError = computed(() => (token.value ? '' : 'Reset token is missing or invalid.'))
  const canSubmit = computed(() => Boolean(token.value))

  function resetValidationErrors () {
    passwordError.value = ''
    confirmPasswordError.value = ''
    formError.value = ''
  }

  function validateForm () {
    resetValidationErrors()

    let hasError = false

    if (!password.value) {
      passwordError.value = 'Please enter a new password'
      hasError = true
    } else if (password.value.length < 6) {
      passwordError.value = 'Password must be at least 6 characters'
      hasError = true
    } else if (!passwordPattern.test(password.value)) {
      passwordError.value = 'Password cannot contain spaces'
      hasError = true
    }

    if (!confirmPassword.value) {
      confirmPasswordError.value = 'Please confirm your password'
      hasError = true
    } else if (confirmPassword.value !== password.value) {
      confirmPasswordError.value = 'Passwords do not match'
      hasError = true
    }

    return !hasError
  }

  async function submitForm () {
    if (!canSubmit.value) {
      formError.value = tokenError.value
      return
    }

    if (!validateForm()) {
      return
    }

    loading.value = true
    formError.value = ''

    try {
      await resetPasswordRequest({
        password: password.value,
        token: token.value,
      })

      authStore.clearSession()

      await router.replace({
        path: '/LogIn',
        query: {
          reset: 'success',
        },
      })
    } catch (error) {
      const apiError = error as ApiError
      const apiMessage = apiError.response?.data?.error || apiError.message || 'Failed to reset password'

      formError.value = resolvePasswordResetError(apiMessage)
    } finally {
      loading.value = false
    }
  }

  return {
    canSubmit,
    confirmPassword,
    confirmPasswordError,
    formError,
    loading,
    password,
    passwordError,
    submitForm,
    token,
    tokenError,
  }
}
