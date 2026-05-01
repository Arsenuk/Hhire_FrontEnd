import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/shared/api/api.js'

const intentOptions = [
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
  const rawTags = ref('')
  const intent = ref('general')
  const images = ref([])

  const showConfirm = ref(false)
  const submitting = ref(false)

  function openConfirm () {
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
      const tags = rawTags.value
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 10)

      const formData = new FormData()

      formData.append('title', title.value)
      formData.append('content', content.value)
      formData.append('intent', intent.value)
      formData.append('sender_type', 'user')

      for (const tag of tags) {
        formData.append('tags', tag)
      }

      for (const file of images.value) {
        formData.append('images', file)
      }

      await api.post('/posts/user', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      router.push('/feed')
    } catch (error) {
      console.error(error)
      alert(
        error.response?.data?.message
        || error.response?.data?.error
        || 'Failed to create post',
      )
    } finally {
      submitting.value = false
    }
  }

  function cancel () {
    router.push('/feed')
  }

  return {
    cancel,
    confirmSubmit,
    content,
    images,
    intent,
    intentOptions,
    openConfirm,
    rawTags,
    showConfirm,
    submitting,
    title,
  }
}
