import { api } from '@/shared/api/api.js'

export async function loginRequest ({ email, password }) {
  const response = await api.post('/auth/login', {
    email,
    password,
  })

  return response.data
}

export async function logoutRequest () {
  await api.post('/auth/logout')
}

export async function registerRequest ({ contacts = [], email, name, password, profile = {} }) {
  const response = await api.post('/auth/register', {
    contacts,
    email,
    name,
    password,
    profile,
  })

  return response.data
}
