import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/shared/api/api'

type CreatePostIntent = 'general' | 'job' | 'mentorship' | 'partnership' | 'hire' | 'offer'

type IntentOption = {
  label: string
  value: CreatePostIntent
}

type ValidationRule = (value: string[]) => true | string

type ApiError = {
  response?: {
    data?: {
      error?: string
      message?: string
    }
  }
}

const intentOptions: IntentOption[] = [
  { label: 'General', value: 'general' },
  { label: 'Job', value: 'job' },
  { label: 'Mentorship', value: 'mentorship' },
  { label: 'Partnership', value: 'partnership' },
  { label: 'Hire', value: 'hire' },
  { label: 'Offer', value: 'offer' },
]

export function useCreatePost () {
  const router = useRouter()

  const title = ref('')
  const content = ref('')
  const tags = ref<string[]>([])
  const intent = ref<CreatePostIntent>('general')
  const images = ref<File[]>([])

  const showConfirm = ref(false)
  const submitting = ref(false)
  const tagRules: ValidationRule[] = [
    value => Boolean(value?.length) || 'Add at least one tag',
  ]

  function openConfirm () {
    if (!tags.value.length) {
      return
    }

    showConfirm.value = true
  }

  async function confirmSubmit () {
    showConfirm.value = false
    await submitPost()
  }

  async function submitPost () {
    if (submitting.value) {
      return
    }

    submitting.value = true

    try {
      const normalizedTags = tags.value
        .map(tag => tag.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 10)

      const formData = new FormData()

      formData.append('title', title.value)
      formData.append('content', content.value)
      formData.append('intent', intent.value)
      formData.append('sender_type', 'user')

      for (const tag of normalizedTags) {
        formData.append('tags', tag)
      }

      for (const file of images.value) {
        formData.append('images', file)
      }

      await api.post('/posts/user', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      await router.push('/Feed')
    } catch (error) {
      const apiError = error as ApiError

      console.error(error)
      alert(
        apiError.response?.data?.message
        || apiError.response?.data?.error
        || 'Failed to create post',
      )
    } finally {
      submitting.value = false
    }
  }

  function cancel () {
    return router.push('/Feed')
  }

  return {
    cancel,
    confirmSubmit,
    content,
    images,
    intent,
    intentOptions,
    openConfirm,
    showConfirm,
    submitting,
    tagRules,
    tags,
    title,
  }
}
