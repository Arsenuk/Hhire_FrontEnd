import type { Nullable, User } from '@/shared/types'

type DisplayNameSource = {
  name?: Nullable<string>
  username?: Nullable<string>
  email?: Nullable<string>
  fullName?: Nullable<string>
}

export function getUserDisplayName (
  user: DisplayNameSource | null = {},
  fallback = 'Unknown user',
) {
  const source = user && typeof user === 'object' ? user : {}
  const candidates = [source.name, source.fullName, source.username, source.email]
  const displayName = candidates.find(value => typeof value === 'string' && value.trim().length > 0)

  return displayName?.trim() || fallback
}
