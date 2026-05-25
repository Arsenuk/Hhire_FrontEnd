import { api } from '@/shared/api/api'
import type { AuthResponse, LoginPayload, RefreshResponse, RegisterPayload, User } from '@/shared/types'

export async function loginRequest ({ email, password }: LoginPayload): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', {
    email,
    password,
  })

  return response.data
}

export async function meRequest (): Promise<User> {
  const response = await api.get<User>('/me')

  return response.data
}

export async function logoutRequest (): Promise<void> {
  await api.post('/auth/logout')
}

export async function refreshRequest (): Promise<RefreshResponse> {
  const response = await api.post<RefreshResponse>('/auth/refresh')

  return response.data
}

export async function registerRequest ({
  contacts = [],
  email,
  name,
  password,
  profile = {},
}: RegisterPayload): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', {
    contacts,
    email,
    name,
    password,
    profile,
  })

  return response.data
}
