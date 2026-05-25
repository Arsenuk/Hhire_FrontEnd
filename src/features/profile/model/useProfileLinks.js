import { ref } from 'vue'
import { isSupportedUsefulUrl, normalizeUsefulLinks, parseUsefulLink } from '@/features/profile/lib/usefulLinks.js'
import { api } from '@/shared/api/api'

export function useProfileLinks ({ loading, errorMessage, successMessage }) {
  const links = ref([])
  const showLinkDialog = ref(false)
  const linkFormRef = ref(null)
  const editingLink = ref(null)

  const showDeleteLinkDialog = ref(false)
  const linkToDelete = ref(null)

  const linkForm = ref({
    url: '',
    description: '',
  })

  const urlRules = [
    value => !!value || 'URL is required',
    value => isSupportedUsefulUrl(value) || 'Please enter a valid URL',
  ]

  function setLinks (nextLinks = []) {
    links.value = nextLinks
  }

  function openAddLink () {
    editingLink.value = null
    linkForm.value = { url: '', description: '' }
    showLinkDialog.value = true
  }

  function openEditLink (link) {
    editingLink.value = link
    linkForm.value = { url: link.url, description: link.description }
    showLinkDialog.value = true
  }

  async function saveLink () {
    const { valid } = await linkFormRef.value.validate()
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

      const res = await api.get('/me/links')
      links.value = normalizeUsefulLinks(res.data)
      showLinkDialog.value = false
    } catch (error) {
      errorMessage.value = error.response?.data?.error || error.message || 'Failed to save link'
    } finally {
      loading.value = false
    }
  }

  function openDeleteLink (id) {
    linkToDelete.value = id
    showDeleteLinkDialog.value = true
  }

  async function deleteConfirmedLink () {
    if (!linkToDelete.value) {
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
