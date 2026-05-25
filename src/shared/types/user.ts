import type { EntityId, Nullable, UnknownRecord } from '@/shared/types/common'

export type UserRole = 'user' | 'company' | 'admin' | string

export interface ContactLink extends UnknownRecord {
  id?: Nullable<EntityId>
  label?: Nullable<string>
  type?: Nullable<string>
  url?: Nullable<string>
  value?: Nullable<string>
}

export interface UsefulLink extends UnknownRecord {
  id?: Nullable<EntityId>
  label?: Nullable<string>
  type?: Nullable<string>
  url?: Nullable<string>
}

export interface User extends UnknownRecord {
  id: Nullable<EntityId>
  name: string
  description: string
  avatar: Nullable<string>
  role: UserRole
  username: Nullable<string>
  email: Nullable<string>
  lastPost: unknown
  contacts?: ContactLink[]
  usefulLinks?: UsefulLink[]
}
