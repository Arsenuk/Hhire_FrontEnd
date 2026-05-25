import type { ContactLink, EntityId, Nullable } from '@/shared/types'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\+?[0-9]{7,15}$/
const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/.+/
const telegramHandlePattern = /^@?[a-zA-Z0-9_]{5,32}$/
const telegramUrlPattern = /^https?:\/\/(t\.me|telegram\.me)\/([a-zA-Z0-9_]{5,32})\/?$/

type ContactType = 'email' | 'phone' | 'telegram' | 'linkedin'

type ContactLinkInput = ContactLink & {
  description?: Nullable<string>
}

type ParsedContactLink = {
  type: ContactType
  value: string
  label: string | null
}

type NormalizedContactLink = {
  id?: Nullable<EntityId>
  type?: Nullable<string>
  url: string
  description: string
  value: string
}

export function normalizeContactsToLinks (contacts: ContactLinkInput[] = []): NormalizedContactLink[] {
  return contacts.map(contact => {
    const value = typeof contact.value === 'string' ? contact.value : ''
    const normalizedTelegram = value.replace(/^@/, '')
    const label = typeof contact.label === 'string' && contact.label.trim() ? contact.label : value

    switch (contact.type) {
      case 'email':
        return {
          id: contact.id,
          type: contact.type,
          url: `mailto:${value}`,
          description: label,
          value,
        }

      case 'phone':
        return {
          id: contact.id,
          type: contact.type,
          url: `tel:${value}`,
          description: label,
          value,
        }

      case 'telegram':
        return {
          id: contact.id,
          type: contact.type,
          url: `https://t.me/${normalizedTelegram}`,
          description: label || `Telegram @${normalizedTelegram}`,
          value,
        }

      case 'linkedin':
      default:
        return {
          id: contact.id,
          type: contact.type,
          url: value,
          description: label,
          value,
        }
    }
  })
}

export function isSupportedContactLink (value = '') {
  const normalized = value.trim()

  return (
    emailPattern.test(normalized) ||
    normalized.startsWith('mailto:') ||
    phonePattern.test(normalized) ||
    normalized.startsWith('tel:') ||
    linkedinPattern.test(normalized) ||
    telegramHandlePattern.test(normalized) ||
    telegramUrlPattern.test(normalized)
  )
}

export function parseContactLink ({ url, description }: { url: string, description: string }): ParsedContactLink {
  const normalizedUrl = url.trim()
  const label = description.trim() || null

  if (normalizedUrl.startsWith('mailto:')) {
    return {
      type: 'email',
      value: normalizedUrl.replace(/^mailto:/, ''),
      label,
    }
  }

  if (emailPattern.test(normalizedUrl)) {
    return {
      type: 'email',
      value: normalizedUrl,
      label,
    }
  }

  if (normalizedUrl.startsWith('tel:')) {
    return {
      type: 'phone',
      value: normalizedUrl.replace(/^tel:/, ''),
      label,
    }
  }

  if (phonePattern.test(normalizedUrl)) {
    return {
      type: 'phone',
      value: normalizedUrl,
      label,
    }
  }

  if (linkedinPattern.test(normalizedUrl)) {
    return {
      type: 'linkedin',
      value: normalizedUrl,
      label,
    }
  }

  const telegramUrlMatch = normalizedUrl.match(telegramUrlPattern)
  if (telegramUrlMatch) {
    return {
      type: 'telegram',
      value: telegramUrlMatch[2],
      label,
    }
  }

  if (telegramHandlePattern.test(normalizedUrl)) {
    return {
      type: 'telegram',
      value: normalizedUrl,
      label,
    }
  }

  throw new Error('Unsupported contact format')
}
