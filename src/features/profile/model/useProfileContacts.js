import { computed, ref } from 'vue'
import { isSupportedContactLink, normalizeContactsToLinks, parseContactLink } from '@/features/profile/lib/contactLinks.js'
import { api } from '@/shared/api/api.js'

export function useProfileContacts ({ loading, errorMessage, successMessage, showToast }) {
  const contacts = ref([])
  const showContactDialog = ref(false)
  const contactFormRef = ref(null)
  const editingContact = ref(null)

  const showDeleteContactDialog = ref(false)
  const contactToDelete = ref(null)
  const contactInfoVisible = ref(false)
  const showContactVisibilityDialog = ref(false)

  const contactForm = ref({
    url: '',
    description: '',
  })

  const contactRules = [
    value => !!value || 'Contact is required',
    value => isSupportedContactLink(value) || 'Use email, phone, LinkedIn, or Telegram',
  ]

  const nextContactInfoVisible = computed(() => !contactInfoVisible.value)
  const contactVisibilityAction = computed(() => nextContactInfoVisible.value ? 'show' : 'hide')
  const contactVisibilityIcon = computed(() => contactInfoVisible.value ? 'mdi-eye' : 'mdi-eye-off')

  function setContacts (nextContacts = []) {
    contacts.value = nextContacts
  }

  function setContactInfoVisible (visible = false) {
    contactInfoVisible.value = Boolean(visible)
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

  function openContactVisibilityDialog () {
    showContactVisibilityDialog.value = true
  }

  async function confirmContactVisibilityChange () {
    const nextVisible = nextContactInfoVisible.value

    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
      const res = await api.put('/me/contact-visibility', {
        visible: nextVisible,
      })

      contactInfoVisible.value = Boolean(res.data?.contactInfoVisible)
      const message = contactInfoVisible.value
        ? 'Contact info is now visible to other users'
        : 'Contact info is now hidden from other users'
      showToast?.(message, 'success')
    } catch (error) {
      errorMessage.value = error.response?.data?.error || error.message || 'Failed to update contact visibility'
    } finally {
      loading.value = false
      showContactVisibilityDialog.value = false
    }
  }

  return {
    confirmContactVisibilityChange,
    contactForm,
    contactFormRef,
    contactInfoVisible,
    contactRules,
    contactVisibilityAction,
    contactVisibilityIcon,
    contacts,
    deleteConfirmedContact,
    editingContact,
    openAddContact,
    openContactVisibilityDialog,
    openDeleteContact,
    openEditContact,
    saveContact,
    setContactInfoVisible,
    setContacts,
    showContactDialog,
    showContactVisibilityDialog,
    showDeleteContactDialog,
  }
}
