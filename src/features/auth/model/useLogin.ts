import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/model/auth.store'

type LoginError = {
  message?: string
}

export function useLogin () {
  const authStore = useAuthStore()
  const route = useRoute()
  const router = useRouter()

  const email = ref('')
  const password = ref('')
  const showPassword = ref(false)
  const rememberMe = ref(false)
  const loginError = ref('')
  const resetSuccessMessage = computed(() => {
    if (route.query.reset !== 'success') {
      return ''
    }

    return 'Password updated, please sign in again.'
  })

  function togglePassword () {
    showPassword.value = !showPassword.value
  }

  async function onLogin () {
    loginError.value = ''

    try {
      await authStore.login(email.value.trim(), password.value, rememberMe.value)
      await router.push('/Feed')
    } catch (error) {
      const typedError = error as LoginError
      loginError.value = typedError.message || 'Login failed'
    }
  }

  return {
    email,
    loginError,
    onLogin,
    password,
    rememberMe,
    resetSuccessMessage,
    showPassword,
    togglePassword,
  }
}
