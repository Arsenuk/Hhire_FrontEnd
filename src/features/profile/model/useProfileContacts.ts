import { computed, ref, type Ref } from 'vue'
import { isSupportedContactLink, normalizeContactsToLinks, parseContactLink } from '@/features/profile/lib/contactLinks'
import { api } from '@/shared/api/api'
import type { ContactLink, EntityId } from '@/shared/types'

type ToastColor = 'success' | 'error' | 'warning' | 'info' | string
type ShowToast = (message: string, color?: ToastColor) => void

type ContactForm = {
  url: string
  description: string
}

type ContactView = ContactLink & {
  description?: string
  url?: string
  value?: string
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

interface UseProfileContactsOptions {
  loading: Ref<boolean>
  errorMessage: Ref<string>
  successMessage: Ref<string>
  showToast?: ShowToast
}

export function useProfileContacts ({ loading, errorMessage, successMessage, showToast }: UseProfileContactsOptions) {
  const contacts = ref<ContactView[]>([])
  const showContactDialog = ref(false)
  const contactFormRef = ref<ValidatableForm | null>(null)
  const editingContact = ref<ContactView | null>(null)

  const showDeleteContactDialog = ref(false)
  const contactToDelete = ref<EntityId | null>(null)
  const contactInfoVisible = ref(false)
  const showContactVisibilityDialog = ref(false)

  const contactForm = ref<ContactForm>({
    url: '',
    description: '',
  })

  const contactRules = [
    (value: string) => !!value || 'Contact is required',
    (value: string) => isSupportedContactLink(value) || 'Use email, phone, LinkedIn, or Telegram',
  ]

  const nextContactInfoVisible = computed(() => !contactInfoVisible.value)
  const contactVisibilityAction = computed(() => nextContactInfoVisible.value ? 'show' : 'hide')
  const contactVisibilityIcon = computed(() => contactInfoVisible.value ? 'mdi-eye' : 'mdi-eye-off')

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

  function openEditContact (contact: ContactView) {
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

  function openContactVisibilityDialog () {
    showContactVisibilityDialog.value = true
  }

  async function confirmContactVisibilityChange () {
    const nextVisible = nextContactInfoVisible.value

    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
      const res = await api.put<{ contactInfoVisible?: boolean }>('/me/contact-visibility', {
        visible: nextVisible,
      })

      contactInfoVisible.value = Boolean(res.data?.contactInfoVisible)
      const message = contactInfoVisible.value
        ? 'Contact info is now visible to other users'
        : 'Contact info is now hidden from other users'
      showToast?.(message, 'success')
    } catch (error) {
      const apiError = error as ApiError
      errorMessage.value = apiError.response?.data?.error || apiError.message || 'Failed to update contact visibility'
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
