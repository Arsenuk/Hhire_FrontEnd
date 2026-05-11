import { ref } from 'vue'
import { isSupportedContactLink, normalizeContactsToLinks, parseContactLink } from '@/features/profile/lib/contactLinks.js'
import { api } from '@/shared/api/api.js'

export function useProfileContacts ({ loading, errorMessage, successMessage }) {
  const contacts = ref([])
  const showContactDialog = ref(false)
  const contactFormRef = ref(null)
  const editingContact = ref(null)

  const showDeleteContactDialog = ref(false)
  const contactToDelete = ref(null)

  const contactForm = ref({
    url: '',
    description: '',
  })

  const contactRules = [
    value => !!value || 'Contact is required',
    value => isSupportedContactLink(value) || 'Use email, phone, LinkedIn, or Telegram',
  ]

  function setContacts (nextContacts = []) {
    contacts.value = nextContacts
  }

  function openAddContact () {
    editingContact.value = null
    contactForm.value = { url: '', description: '' }
    showContactDialog.value = true
  }

  function openEditContact (contact) {
    editingContact.value = contact
    contactForm.value = { url: contact.value || contact.url, description: contact.description }
    showContactDialog.value = true
  }

  async function saveContact () {
    const { valid } = await contactFormRef.value.validate()
    if (!valid) {
      return
    }

    loading.value = true
    errorMessage.value = ''

    try {
      const payload = parseContactLink(contactForm.value)

      await (
        editingContact.value
          ? api.put(`/contacts/${editingContact.value.id}`, payload)
          : api.post('/contacts', payload)
      )

      const res = await api.get('/contacts')
      contacts.value = normalizeContactsToLinks(res.data)
      showContactDialog.value = false
    } catch (error) {
      errorMessage.value = error.response?.data?.error || error.message || 'Failed to save contact'
    } finally {
      loading.value = false
    }
  }

  function openDeleteContact (id) {
    contactToDelete.value = id
    showDeleteContactDialog.value = true
  }

  async function deleteConfirmedContact () {
    if (!contactToDelete.value) {
      return
    }

    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
      await api.delete(`/contacts/${contactToDelete.value}`)
      contacts.value = contacts.value.filter(contact => contact.id !== contactToDelete.value)
      successMessage.value = 'Contact deleted successfully'
    } catch {
      errorMessage.value = 'Failed to delete contact'
    } finally {
      loading.value = false
      showDeleteContactDialog.value = false
      contactToDelete.value = null
    }
  }

  return {
    contactForm,
    contactFormRef,
    contactRules,
    contacts,
    deleteConfirmedContact,
    editingContact,
    openAddContact,
    openDeleteContact,
    openEditContact,
    saveContact,
    setContacts,
    showContactDialog,
    showDeleteContactDialog,
  }
}
