import { computed, onMounted, ref } from 'vue'
import { normalizeUser } from '@/entities/user/lib/normalizeUser'
import { useAuthStore } from '@/features/auth/model/auth.store'
import type { ProfileForm, ProfileMeResponse, ProfilePostView, ValidatableForm } from '@/features/profile/model/contracts'
import { useProfileContacts } from '@/features/profile/model/useProfileContacts'
import { useProfileLinks } from '@/features/profile/model/useProfileLinks'
import { useProfilePosts } from '@/features/profile/model/useProfilePosts'
import { api } from '@/shared/api/api'
import { useSnackbar } from '@/shared/lib/composables/useSnackbar'
import type { ContactLink, UsefulLink } from '@/shared/types'

export function useProfileMe () {
  const authStore = useAuthStore()
  const user = computed(() => authStore.user)

  const loading = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')
  const { showToast, snackbar } = useSnackbar()

  const editMode = ref(false)
  const profileEditorOpen = ref(false)
  const formRef = ref<ValidatableForm | null>(null)

  const editForm = ref<ProfileForm>({
    name: '',
    description: '',
    avatarFile: null,
  })

  const nameRules = [
    (value: string) => !!value || 'Name is required',
    (value: string) => value.length >= 2 || 'Minimum 2 characters',
  ]

  const profileLinks = useProfileLinks({
    errorMessage,
    loading,
    successMessage,
  })

  const profileContacts = useProfileContacts({
    errorMessage,
    loading,
    showToast,
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
        api.get<ProfileMeResponse>('/me'),
        api.get<ContactLink[]>('/contacts'),
        api.get<UsefulLink[]>('/me/links'),
        api.get<{ posts?: ProfilePostView[] }>('/posts'),
      ])

      const normalizedUser = normalizeUser(data)

      authStore.setUser(normalizedUser)
      profileContacts.setContacts(contactsResponse.data || [])
      profileContacts.setContactInfoVisible(Boolean(data.contactInfoVisible))
      profileLinks.setLinks(linksResponse.data || [])
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
    const { valid } = await formRef.value?.validate() ?? { valid: false }
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
    void loadProfile()
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
    snackbar,
    successMessage,
    user,
    ...profileContacts,
    ...profileLinks,
    ...profilePosts,
  }
}
