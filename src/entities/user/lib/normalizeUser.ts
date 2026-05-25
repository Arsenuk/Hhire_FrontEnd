import { getUserDisplayName } from '@/entities/user/lib/getUserDisplayName'
import type { EntityId, User, UserRole } from '@/shared/types'

type UserSource = Partial<User> & Record<string, unknown> & {
  user_id?: EntityId | null
  sender_id?: EntityId | null
  receiver_id?: EntityId | null
  company_id?: EntityId | null
  sender_avatar?: string | null
  receiver_avatar?: string | null
  last_post?: unknown
}

type UserOverrides = Partial<User>

export function normalizeUser (user: UserSource = {}, overrides: UserOverrides = {}): User {
  const source = user && typeof user === 'object' ? user : {}

  const normalized: User = {
    ...source,
    id: (source.id ?? source.user_id ?? source.sender_id ?? source.receiver_id ?? source.company_id ?? null) as EntityId | null,
    name: getUserDisplayName(source),
    description: typeof source.description === 'string' ? source.description : '',
    avatar: (source.avatar ?? source.sender_avatar ?? source.receiver_avatar ?? null) as string | null,
    role: (source.role ?? (source.company_id ? 'company' : 'user')) as UserRole,
    username:
      typeof source.username === 'string' && source.username.trim()
        ? source.username.trim()
        : null,
    email: typeof source.email === 'string' && source.email.trim() ? source.email.trim() : null,
    lastPost: source.lastPost ?? source.last_post ?? null,
  }

  return {
    ...normalized,
    ...overrides,
  }
}

export function normalizeUsers (users: UserSource[] = []): User[] {
  return users.map(user => normalizeUser(user))
}
