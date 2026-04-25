import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

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
      router.push('/feed')
    } catch (error) {
      loginError.value = error.message || 'Login failed'
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
