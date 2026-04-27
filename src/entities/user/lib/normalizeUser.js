import { getUserDisplayName } from '@/entities/user/lib/getUserDisplayName.js'

export function normalizeUser(user = {}, overrides = {}) {
  const source = user && typeof user === 'object' ? user : {}

  const normalized = {
    id: source.id ?? source.user_id ?? source.sender_id ?? source.receiver_id ?? source.company_id ?? null,
    name: getUserDisplayName(source),
    description: typeof source.description === 'string' ? source.description : '',
    avatar: source.avatar ?? source.sender_avatar ?? source.receiver_avatar ?? null,
    role: source.role ?? (source.company_id ? 'company' : 'user'),
    username:
      typeof source.username === 'string' && source.username.trim()
        ? source.username.trim()
        : null,
    email: typeof source.email === 'string' && source.email.trim() ? source.email.trim() : null,
    lastPost: source.lastPost ?? source.last_post ?? null,
  }

  return {
    ...source,
    ...normalized,
    ...overrides,
  }
}

export function normalizeUsers(users = []) {
  return users.map(user => normalizeUser(user))
}
