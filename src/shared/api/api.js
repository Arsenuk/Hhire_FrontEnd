import axios from 'axios'
import { API_BASE_URL } from '@/shared/config/api.js'
import { clearAuthStorage, getAccessToken, setAccessToken } from '@/shared/api/tokenStorage.js'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

let refreshPromise = null

async function syncAuthStoreAccessToken (token) {
  try {
    const { useAuthStore } = await import('@/features/auth/model/auth.store.js')
    const authStore = useAuthStore()

    authStore.setAccessToken(token)
  } catch (error) {
    console.warn('Failed to sync access token with auth store', error)
  }
}

async function clearAuthSession () {
  clearAuthStorage()

  try {
    const { useAuthStore } = await import('@/features/auth/model/auth.store.js')
    const authStore = useAuthStore()

    authStore.clearSession()
  } catch (error) {
    console.warn('Failed to clear auth store session', error)
  }
}

function shouldSkipRefresh (url = '') {
  return [
    '/auth/login',
    '/auth/register',
    '/auth/logout',
    '/auth/refresh',
  ].some(authUrl => url.includes(authUrl))
}

async function refreshAccessToken () {
  if (!refreshPromise) {
    refreshPromise = axios.post(`${API_BASE_URL}/auth/refresh`, null, {
      withCredentials: true,
    })
      .then(async response => {
        const accessToken = response.data?.accessToken

        if (!accessToken) {
          throw new Error('Refresh response does not include access token')
        }

        setAccessToken(accessToken)
        await syncAuthStoreAccessToken(accessToken)
        return accessToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

api.interceptors.request.use(config => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    const status = error.response?.status
    const requestUrl = originalRequest?.url || ''

    if (!originalRequest || status !== 401 || originalRequest._retry || shouldSkipRefresh(requestUrl)) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const accessToken = await refreshAccessToken()

      originalRequest.headers = originalRequest.headers || {}
      originalRequest.headers.Authorization = `Bearer ${accessToken}`

      return api(originalRequest)
    } catch (refreshError) {
      await clearAuthSession()
      return Promise.reject(refreshError)
    }
  },
)
