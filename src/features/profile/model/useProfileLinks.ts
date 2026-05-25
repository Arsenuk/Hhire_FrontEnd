import { ref, type Ref } from 'vue'
import { isSupportedUsefulUrl, normalizeUsefulLinks, parseUsefulLink } from '@/features/profile/lib/usefulLinks'
import { api } from '@/shared/api/api'
import type { EntityId, UsefulLink } from '@/shared/types'

type LinkForm = {
  url: string
  description: string
}

type LinkView = UsefulLink & {
  description?: string
  url?: string
}

type ValidatableForm = {
  validate: () => Promise<{ valid: boolean }>
}

type ApiError = {
  message?: string
  response?: {
    data?: {
      error?: string
    }
  }
}

interface UseProfileLinksOptions {
  loading: Ref<boolean>
  errorMessage: Ref<string>
  successMessage: Ref<string>
}

export function useProfileLinks ({ loading, errorMessage, successMessage }: UseProfileLinksOptions) {
  const links = ref<LinkView[]>([])
  const showLinkDialog = ref(false)
  const linkFormRef = ref<ValidatableForm | null>(null)
  const editingLink = ref<LinkView | null>(null)

  const showDeleteLinkDialog = ref(false)
  const linkToDelete = ref<EntityId | null>(null)

  const linkForm = ref<LinkForm>({
    url: '',
    description: '',
  })

  const urlRules = [
    (value: string) => !!value || 'URL is required',
    (value: string) => isSupportedUsefulUrl(value) || 'Please enter a valid URL',
  ]

  function setLinks (nextLinks: UsefulLink[] = []) {
    links.value = normalizeUsefulLinks(nextLinks)
  }

  function openAddLink () {
    editingLink.value = null
    linkForm.value = { url: '', description: '' }
    showLinkDialog.value = true
  }

  function openEditLink (link: LinkView) {
    editingLink.value = link
    linkForm.value = { url: link.url || '', description: link.description || '' }
    showLinkDialog.value = true
  }

  async function saveLink () {
    const { valid } = await linkFormRef.value?.validate() ?? { valid: false }
    if (!valid) {
      return
    }

    loading.value = true
    errorMessage.value = ''

    try {
      const payload = parseUsefulLink(linkForm.value)

      await (
        editingLink.value
          ? api.put(`/me/links/${editingLink.value.id}`, payload)
          : api.post('/me/links', payload)
      )

      const res = await api.get<UsefulLink[]>('/me/links')
      links.value = normalizeUsefulLinks(res.data || [])
      showLinkDialog.value = false
    } catch (error) {
      const apiError = error as ApiError
      errorMessage.value = apiError.response?.data?.error || apiError.message || 'Failed to save link'
    } finally {
      loading.value = false
    }
  }

  function openDeleteLink (id: EntityId | null | undefined) {
    linkToDelete.value = id ?? null
    showDeleteLinkDialog.value = true
  }

  async function deleteConfirmedLink () {
    if (linkToDelete.value == null) {
      return
    }

    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
      await api.delete(`/me/links/${linkToDelete.value}`)
      links.value = links.value.filter(link => link.id !== linkToDelete.value)
      successMessage.value = 'Link deleted successfully'
    } catch {
      errorMessage.value = 'Failed to delete link'
    } finally {
      loading.value = false
      showDeleteLinkDialog.value = false
      linkToDelete.value = null
    }
  }

  return {
    deleteConfirmedLink,
    editingLink,
    linkForm,
    linkFormRef,
    links,
    openAddLink,
    openDeleteLink,
    openEditLink,
    saveLink,
    setLinks,
    showDeleteLinkDialog,
    showLinkDialog,
    urlRules,
  }
}
