const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\+?[0-9]{7,15}$/
const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/.+/
const telegramHandlePattern = /^@?[a-zA-Z0-9_]{5,32}$/
const telegramUrlPattern = /^https?:\/\/(t\.me|telegram\.me)\/([a-zA-Z0-9_]{5,32})\/?$/

export function normalizeContactsToLinks (contacts = []) {
  return contacts.map(contact => {
    const value = contact.value || ''
    const normalizedTelegram = value.replace(/^@/, '')

    switch (contact.type) {
      case 'email':
        return {
          id: contact.id,
          type: contact.type,
          url: `mailto:${value}`,
          description: contact.label || value,
          value,
        }

      case 'phone':
        return {
          id: contact.id,
          type: contact.type,
          url: `tel:${value}`,
          description: contact.label || value,
          value,
        }

      case 'telegram':
        return {
          id: contact.id,
          type: contact.type,
          url: `https://t.me/${normalizedTelegram}`,
          description: contact.label || `Telegram @${normalizedTelegram}`,
          value,
        }

      case 'linkedin':
      default:
        return {
          id: contact.id,
          type: contact.type,
          url: value,
          description: contact.label || value,
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

export function parseContactLink ({ url, description }) {
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
