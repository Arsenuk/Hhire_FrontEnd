export function normalizeUsefulUrl (value = '') {
  const normalized = value.trim()

  if (!normalized) {
    return ''
  }

  return /^https?:\/\//i.test(normalized)
    ? normalized
    : `https://${normalized}`
}

export function isSupportedUsefulUrl (value = '') {
  const normalized = normalizeUsefulUrl(value)

  if (/\s/.test(value.trim())) {
    return false
  }

  try {
    const url = new URL(normalized)
    const hostname = url.hostname.toLowerCase()
    const hasDomainLikeHostname = hostname.includes('.') || hostname === 'localhost'
    const isIpAddress = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':')

    return (
      ['http:', 'https:'].includes(url.protocol) &&
      Boolean(hostname) &&
      (hasDomainLikeHostname || isIpAddress)
    )
  } catch {
    return false
  }
}

export function normalizeUsefulLink (link = {}) {
  return {
    id: link.id,
    url: normalizeUsefulUrl(link.url || ''),
    description: link.description || link.url || '',
  }
}

export function normalizeUsefulLinks (links = []) {
  return links.map(normalizeUsefulLink)
}

export function parseUsefulLink ({ url, description }) {
  if (!isSupportedUsefulUrl(url)) {
    throw new Error('Invalid URL')
  }

  return {
    url: normalizeUsefulUrl(url),
    description: description.trim() || null,
  }
}
