import { computed, onMounted, ref } from 'vue'
import { normalizeUser } from '@/entities/user/lib/normalizeUser.js'
import { api } from '@/shared/api/api.js'
import { useAuthStore } from '@/features/auth/model/auth.store.js'
import { normalizeContactsToLinks } from '@/features/profile/lib/contactLinks.js'
import { normalizeUsefulLinks } from '@/features/profile/lib/usefulLinks.js'
import { useProfileContacts } from '@/features/profile/model/useProfileContacts.js'
import { useProfileLinks } from '@/features/profile/model/useProfileLinks.js'
import { useProfilePosts } from '@/features/profile/model/useProfilePosts.js'

export function useProfileMe () {
  const authStore = useAuthStore()
  const user = computed(() => authStore.user)

  const loading = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  const editMode = ref(false)
  const profileEditorOpen = ref(false)
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
    errorMessage,
    loading,
    successMessage,
  })

  const profileContacts = useProfileContacts({
    errorMessage,
    loading,
    successMessage,
  })

  const profilePosts = useProfilePosts({
    errorMessage,
    loading,
    successMessage,
    user,
  })

  async function loadProfile () {
    loading.value = true
    errorMessage.value = ''

    try {
      const [{ data }, contactsResponse, linksResponse, postsResponse] = await Promise.all([
        api.get('/me'),
        api.get('/contacts'),
        api.get('/me/links'),
        api.get('/posts'),
      ])

      const normalizedUser = normalizeUser(data)

      authStore.setUser(normalizedUser)
      profileContacts.setContacts(normalizeContactsToLinks(contactsResponse.data || []))
      profileLinks.setLinks(normalizeUsefulLinks(linksResponse.data || []))
      profilePosts.setPosts(postsResponse.data?.posts || [])

      editForm.value.name = normalizedUser.name
      editForm.value.description = normalizedUser.description
    } catch {
      errorMessage.value = 'Failed to load profile'
    } finally {
      loading.value = false
    }
  }

  async function saveProfile () {
    const { valid } = await formRef.value.validate()
    if (!valid) {
      return
    }

    loading.value = true
    errorMessage.value = ''

    try {
      await api.put('/me', {
        name: editForm.value.name,
        description: editForm.value.description,
      })

      const avatarFile = Array.isArray(editForm.value.avatarFile)
        ? editForm.value.avatarFile[0]
        : editForm.value.avatarFile

      if (avatarFile) {
        const formData = new FormData()
        formData.append('avatar', avatarFile)
        await api.post('/me/avatar', formData)
      }

      profileEditorOpen.value = false
      successMessage.value = 'Profile updated successfully'
      await loadProfile()
    } catch {
      errorMessage.value = 'Failed to update profile'
    } finally {
      loading.value = false
    }
  }

  function cancelEdit () {
    profileEditorOpen.value = false
  }

  function openEditMode () {
    editMode.value = true
  }

  function closeEditMode () {
    editMode.value = false
    profileEditorOpen.value = false
  }

  function openProfileEditor () {
    profileEditorOpen.value = true
  }

  onMounted(() => {
    authStore.loadUserFromStorage()
    loadProfile()
  })

  return {
    cancelEdit,
    closeEditMode,
    editForm,
    editMode,
    errorMessage,
    formRef,
    loading,
    nameRules,
    openEditMode,
    openProfileEditor,
    profileEditorOpen,
    saveProfile,
    successMessage,
    user,
    ...profileContacts,
    ...profileLinks,
    ...profilePosts,
  }
}
