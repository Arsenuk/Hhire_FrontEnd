import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/shared/api/api'
import { registerRequest } from '@/features/auth/api/auth.api'
import { useAuthStore } from '@/features/auth/model/auth.store'
import { isSupportedContactLink, parseContactLink } from '@/features/profile/lib/contactLinks.js'
import { isSupportedUsefulUrl, parseUsefulLink } from '@/features/profile/lib/usefulLinks.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
  const contactInfo = ref(createEmptyLink())
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
    contactInfo.value.error = false

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

  function validateStepOne () {
    resetStepOneErrors()

    const normalizedName = firstName.value.trim()
    const normalizedEmail = email.value.trim()
    const hasPasswordWhitespace = /\s/.test(password.value)
    let hasError = false

    if (!normalizedName) {
      firstNameError.value = 'Please enter your name'
      hasError = true
    } else if (normalizedName.length < 2) {
      firstNameError.value = 'Name must be at least 2 characters'
      hasError = true
    } else if (normalizedName.length > 50) {
      firstNameError.value = 'Name must be 50 characters or less'
      hasError = true
    }

    if (!normalizedEmail) {
      emailError.value = 'Please enter your email'
      hasError = true
    } else if (!emailPattern.test(normalizedEmail)) {
      emailError.value = 'Please enter a valid email'
      hasError = true
    }

    if (!password.value) {
      passwordError.value = 'Please enter your password'
      hasError = true
    } else if (password.value.length < 6) {
      passwordError.value = 'Password must be at least 6 characters'
      hasError = true
    } else if (hasPasswordWhitespace) {
      passwordError.value = 'Password cannot contain spaces'
      hasError = true
    }

    return !hasError
  }

  function submitStepOne () {
    if (validateStepOne()) {
      currentStep.value = 2
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
    if (!validateStepOne()) {
      currentStep.value = 1
      return
    }

    resetStepTwoErrors()

    if (!description.value.trim()) {
      descriptionError.value = 'Please add a description about yourself'
      return
    }

    if (!contactInfo.value.url.trim() || !contactInfo.value.description.trim()) {
      contactInfo.value.error = 'Contact info and description are required'
      return
    }

    if (!isSupportedContactLink(contactInfo.value.url)) {
      contactInfo.value.error = 'Use email, phone, LinkedIn, or Telegram'
      return
    }

    let hasInvalidLink = false

    for (const link of links.value) {
      const hasAnyLinkValue = link.url.trim() || link.description.trim()

      if (hasAnyLinkValue && (!link.url.trim() || !link.description.trim())) {
        link.error = 'Both URL and description are required'
        hasInvalidLink = true
      } else if (hasAnyLinkValue && !isSupportedUsefulUrl(link.url)) {
        link.error = 'Please enter a valid URL'
        hasInvalidLink = true
      }
    }

    if (hasInvalidLink) {
      return
    }

    loading.value = true

    try {
      const contacts = [
        parseContactLink(contactInfo.value),
      ]
      const usefulLinks = links.value
        .filter(link => link.url.trim() || link.description.trim())
        .map(parseUsefulLink)

      await registerRequest({
        contacts,
        email: email.value.trim(),
        name: firstName.value,
        password: password.value.trim(),
        profile: {
          description: description.value.trim(),
        },
      })

      await authStore.login(email.value.trim(), password.value.trim())

      await Promise.all(contacts.map(contact => api.post('/contacts', contact)))
      await Promise.all(usefulLinks.map(link => api.post('/me/links', link)))

      const avatarFile = Array.isArray(profileImageFile.value)
        ? profileImageFile.value[0]
        : profileImageFile.value

      if (avatarFile) {
        const formData = new FormData()
        formData.append('avatar', avatarFile)

        await api.post('/me/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      router.push('/feed')
    } catch (error) {
      console.error(error)
      descriptionError.value = error.response?.data?.error || error.message || 'Registration failed'
    } finally {
      loading.value = false
    }
  }

  return {
    addLink,
    cardWidth,
    contactInfo,
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
