import { api } from '@/shared/api/api'
import type { AuthResponse, LoginPayload, RefreshResponse, RegisterPayload, User } from '@/shared/types'

type AuthMessageResponse = {
  message: string
}

type ForgotPasswordPayload = {
  email: string
}

type ResetPasswordPayload = {
  password: string
  token: string
}

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

export async function forgotPasswordRequest ({ email }: ForgotPasswordPayload): Promise<AuthMessageResponse> {
  const response = await api.post<AuthMessageResponse>('/auth/forgot-password', {
    email,
  })

  return response.data
}

export async function resetPasswordRequest ({ password, token }: ResetPasswordPayload): Promise<AuthMessageResponse> {
  const response = await api.post<AuthMessageResponse>('/auth/reset-password', {
    password,
    token,
  })

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
