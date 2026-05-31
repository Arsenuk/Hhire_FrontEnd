import { ref, type Ref } from 'vue'
import { isSupportedContactLink, normalizeContactsToLinks, parseContactLink } from '@/features/profile/lib/contactLinks'
import type { ContactForm, ProfileContactView, ValidatableForm } from '@/features/profile/model/contracts'
import { api } from '@/shared/api/api'
import type { ContactLink, EntityId } from '@/shared/types'

type ApiError = {
  message?: string
  response?: {
    data?: {
      error?: string
    }
  }
}

interface UseProfileContactsOptions {
  loading: Ref<boolean>
  errorMessage: Ref<string>
  successMessage: Ref<string>
}

export function useProfileContacts ({ loading, errorMessage, successMessage }: UseProfileContactsOptions) {
  const contacts = ref<ProfileContactView[]>([])
  const showContactDialog = ref(false)
  const contactFormRef = ref<ValidatableForm | null>(null)
  const editingContact = ref<ProfileContactView | null>(null)

  const showDeleteContactDialog = ref(false)
  const contactToDelete = ref<EntityId | null>(null)
  const contactInfoVisible = ref(false)

  const contactForm = ref<ContactForm>({
    url: '',
    description: '',
  })

  const contactRules = [
    (value: string) => !!value || 'Contact is required',
    (value: string) => isSupportedContactLink(value) || 'Use email, phone, LinkedIn, or Telegram',
  ]

  function setContacts (nextContacts: ContactLink[] = []) {
    contacts.value = normalizeContactsToLinks(nextContacts)
  }

  function setContactInfoVisible (visible = false) {
    contactInfoVisible.value = Boolean(visible)
  }

  function openAddContact () {
    editingContact.value = null
    contactForm.value = { url: '', description: '' }
    showContactDialog.value = true
  }

  function openEditContact (contact: ProfileContactView) {
    editingContact.value = contact
    contactForm.value = {
      url: contact.value || contact.url || '',
      description: contact.description || '',
    }
    showContactDialog.value = true
  }

  async function saveContact () {
    const { valid } = await contactFormRef.value?.validate() ?? { valid: false }
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

      const res = await api.get<ContactLink[]>('/contacts')
      contacts.value = normalizeContactsToLinks(res.data || [])
      showContactDialog.value = false
    } catch (error) {
      const apiError = error as ApiError
      errorMessage.value = apiError.response?.data?.error || apiError.message || 'Failed to save contact'
    } finally {
      loading.value = false
    }
  }

  function openDeleteContact (id: EntityId | null | undefined) {
    contactToDelete.value = id ?? null
    showDeleteContactDialog.value = true
  }

  async function deleteConfirmedContact () {
    if (contactToDelete.value == null) {
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
    contactInfoVisible,
    contactRules,
    contacts,
    deleteConfirmedContact,
    editingContact,
    openAddContact,
    openDeleteContact,
    openEditContact,
    saveContact,
    setContactInfoVisible,
    setContacts,
    showContactDialog,
    showDeleteContactDialog,
  }
}
