import { ref } from 'vue'
import { api } from '@/api/api.js'

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
    value => /^https?:\/\//.test(value) || 'URL must start with http(s)',
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
      await (editingLink.value ? api.put(`/user-links/${editingLink.value.id}`, linkForm.value) : api.post('/user-links', linkForm.value))

      const res = await api.get('/user-links')
      links.value = res.data
      showLinkDialog.value = false
    } catch {
      errorMessage.value = 'Failed to save link'
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
      await api.delete(`/user-links/${linkToDelete.value}`)
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
