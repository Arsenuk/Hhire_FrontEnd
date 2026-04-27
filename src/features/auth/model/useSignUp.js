import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/shared/api/api.js'
import { registerRequest } from '@/features/auth/api/auth.api.js'
import { useAuthStore } from '@/features/auth/model/auth.store.js'

function createEmptyLink () {
  return {
    description: '',
    error: false,
    url: '',
  }
}

export function useSignUp () {
  const router = useRouter()
  const authStore = useAuthStore()

  const currentStep = ref(1)
  const steps = [
    { id: 1, name: 'Account Creation' },
    { id: 2, name: 'Profile Information' },
  ]

  const cardWidth = computed(() => (currentStep.value === 1 ? '480px' : '100%'))

  const email = ref('')
  const password = ref('')
  const firstName = ref('')

  const description = ref('')
  const profileImageFile = ref(null)
  const profileImageName = ref('')
  const links = ref([createEmptyLink()])

  const showPassword = ref(false)
  const loading = ref(false)

  const firstNameError = ref('')
  const emailError = ref('')
  const passwordError = ref('')
  const descriptionError = ref('')

  function resetStepOneErrors () {
    firstNameError.value = ''
    emailError.value = ''
    passwordError.value = ''
  }

  function resetStepTwoErrors () {
    descriptionError.value = ''

    for (const link of links.value) {
      link.error = false
    }
  }

  function togglePassword () {
    showPassword.value = !showPassword.value
  }

  async function nextStep () {
    if (currentStep.value === 1) {
      await submitStepOne()
      return
    }

    currentStep.value += 1
  }

  function prevStep () {
    if (currentStep.value > 1) {
      currentStep.value -= 1
    }
  }

  async function submitStepOne () {
    resetStepOneErrors()

    if (!firstName.value.trim()) {
      firstNameError.value = 'Please enter your name'
      return
    }

    if (!email.value.trim()) {
      emailError.value = 'Please enter your email'
      return
    }

    if (!password.value.trim() || password.value.length < 6) {
      passwordError.value = 'Password must be at least 6 characters'
      return
    }

    loading.value = true

    try {
      await registerRequest({
        email: email.value.trim(),
        name: firstName.value.trim(),
        password: password.value.trim(),
      })
      await authStore.login(email.value.trim(), password.value.trim())
      currentStep.value = 2
    } catch (error) {
      console.error(error)
      emailError.value = error.response?.data?.error || error.message || 'Registration failed'
    } finally {
      loading.value = false
    }
  }

  function handleFileUpload (event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    profileImageFile.value = file
    profileImageName.value = file.name
  }

  function addLink () {
    links.value.push(createEmptyLink())
  }

  function removeLink (index) {
    if (links.value.length > 1) {
      links.value.splice(index, 1)
    }
  }

  async function submitForm () {
    resetStepTwoErrors()

    if (!description.value.trim()) {
      descriptionError.value = 'Please add a description about yourself'
      return
    }

    let hasInvalidLink = false

    for (const link of links.value) {
      if (!link.url.trim() || !link.description.trim()) {
        link.error = true
        hasInvalidLink = true
      }
    }

    if (hasInvalidLink) {
      return
    }

    loading.value = true

    try {
      await api.put('/users/profile', {
        description: description.value,
        name: firstName.value,
      })

      if (profileImageFile.value) {
        const formData = new FormData()
        formData.append('avatar', profileImageFile.value)

        await api.post('/users/me/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      for (const link of links.value) {
        await api.post('/user-links', {
          description: link.description,
          url: link.url,
        })
      }

      router.push('/feed')
    } catch (error) {
      console.error(error)
      descriptionError.value = 'Failed to save profile'
    } finally {
      loading.value = false
    }
  }

  return {
    addLink,
    cardWidth,
    currentStep,
    description,
    descriptionError,
    email,
    emailError,
    firstName,
    firstNameError,
    handleFileUpload,
    links,
    loading,
    nextStep,
    password,
    passwordError,
    prevStep,
    profileImageName,
    removeLink,
    showPassword,
    steps,
    submitForm,
    togglePassword,
  }
}
