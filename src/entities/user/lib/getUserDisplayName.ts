import type { User } from '@/shared/types'

type DisplayNameSource = Partial<User> & {
  fullName?: string | null
}

export function getUserDisplayName (
  user: DisplayNameSource | null | undefined = {},
  fallback = 'Unknown user',
) {
  const source = user && typeof user === 'object' ? user : {}
  const candidates = [source.name, source.fullName, source.username, source.email]
  const displayName = candidates.find(value => typeof value === 'string' && value.trim().length > 0)

  return displayName?.trim() || fallback
}
