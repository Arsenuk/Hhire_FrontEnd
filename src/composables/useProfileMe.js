import { computed, onMounted, ref } from 'vue'
import { api } from '@/api/api.js'
import { useAuthStore } from '@/stores/auth.js'
import { useProfileLinks } from '@/composables/useProfileLinks.js'
import { useProfilePosts } from '@/composables/useProfilePosts.js'

export function useProfileMe() {
  const authStore = useAuthStore()
  const user = computed(() => authStore.user)

  const loading = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  const editing = ref(false)
  const formRef = ref(null)

  const editForm = ref({
    name: '',
    description: '',
    avatarFile: null,
  })

  const nameRules = [
    value => !!value || 'Name is required',
    value => value.length >= 2 || 'Minimum 2 characters',
  ]

  const profileLinks = useProfileLinks({
    loading,
    errorMessage,
    successMessage,
  })

  const profilePosts = useProfilePosts({
    user,
    loading,
    errorMessage,
    successMessage,
  })

  async function loadProfile() {
    loading.value = true
    errorMessage.value = ''

    try {
      const [profileRes, linksRes, postsRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/user-links'),
        api.get('/posts'),
      ])

      authStore.user = profileRes.data
      profileLinks.setLinks(linksRes.data)
      profilePosts.setPosts(postsRes.data.posts || [])

      editForm.value.name = profileRes.data.name
      editForm.value.description = profileRes.data.description
    } catch {
      errorMessage.value = 'Failed to load profile'
    } finally {
      loading.value = false
    }
  }

  async function saveProfile() {
    const { valid } = await formRef.value.validate()
    if (!valid) return

    loading.value = true
    errorMessage.value = ''

    try {
      await api.put('/users/profile', {
        name: editForm.value.name,
        description: editForm.value.description,
      })

      if (editForm.value.avatarFile) {
        const formData = new FormData()
        formData.append('avatar', editForm.value.avatarFile)
        await api.post('/users/me/avatar', formData)
      }

      editing.value = false
      successMessage.value = 'Profile updated successfully'
      await loadProfile()
    } catch {
      errorMessage.value = 'Failed to update profile'
    } finally {
      loading.value = false
    }
  }

  function cancelEdit() {
    editing.value = false
  }
  onMounted(() => {
    authStore.loadUserFromStorage()
    loadProfile()
  })

  return {
    cancelEdit,
    editForm,
    editing,
    errorMessage,
    formRef,
    loading,
    nameRules,
    saveProfile,
    successMessage,
    user,
    ...profileLinks,
    ...profilePosts,
  }
}
