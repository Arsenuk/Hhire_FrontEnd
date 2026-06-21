import type { UnknownRecord } from '@/shared/types/common'
import type { ContactLink, User } from '@/shared/types/user'

export interface LoginPayload {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterPayload {
  contacts?: ContactLink[]
  email: string
  name: string
  password: string
  profile?: UnknownRecord
}

export interface AuthResponse extends UnknownRecord {
  accessToken: string
  user: User
}

export interface RefreshResponse extends UnknownRecord {
  accessToken: string
  rememberMe?: boolean
}
