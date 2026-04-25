import { api } from '@/api/api.js'

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

export async function registerRequest ({ email, name, password }) {
  const response = await api.post('/auth/register', {
    email,
    name,
    password,
  })

  return response.data
}
