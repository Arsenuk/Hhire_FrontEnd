import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/model/auth.store'

type LoginError = {
  message?: string
}

export function useLogin () {
  const authStore = useAuthStore()
  const router = useRouter()

  const email = ref('')
  const password = ref('')
  const showPassword = ref(false)
  const rememberMe = ref(false)
  const loginError = ref('')

  function togglePassword () {
    showPassword.value = !showPassword.value
  }

  async function onLogin () {
    loginError.value = ''

    try {
      await authStore.login(email.value.trim(), password.value)
      await router.push('/feed')
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
    showPassword,
    togglePassword,
  }
}
