import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/shared/config/api.js'
import { clearAuthStorage, getAccessToken, setAccessToken } from '@/shared/api/tokenStorage'
import type { RefreshResponse } from '@/shared/types'

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

type ApiErrorPayload = {
  error?: string
}

let refreshPromise: Promise<string> | null = null

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

async function syncAuthStoreAccessToken (token: string): Promise<void> {
  try {
    const { useAuthStore } = await import('@/features/auth/model/auth.store')
    const authStore = useAuthStore()

    authStore.setAccessToken(token)
  } catch (error) {
    console.warn('Failed to sync access token with auth store', error)
  }
}

async function clearAuthSession (): Promise<void> {
  clearAuthStorage()

  try {
    const { useAuthStore } = await import('@/features/auth/model/auth.store')
    const authStore = useAuthStore()

    authStore.clearSession()
  } catch (error) {
    console.warn('Failed to clear auth store session', error)
  }
}

function shouldSkipRefresh (url = ''): boolean {
  return [
    '/auth/login',
    '/auth/register',
    '/auth/logout',
    '/auth/refresh',
  ].some(authUrl => url.includes(authUrl))
}

async function refreshAccessToken (): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios.post<RefreshResponse>(`${API_BASE_URL}/auth/refresh`, null, {
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

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  response => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const status = error.response?.status
    const requestUrl = originalRequest?.url || ''

    if (!originalRequest || status !== 401 || originalRequest._retry || shouldSkipRefresh(requestUrl)) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const accessToken = await refreshAccessToken()

      if (typeof originalRequest.headers?.set === 'function') {
        originalRequest.headers.set('Authorization', `Bearer ${accessToken}`)
      }

      return api(originalRequest)
    } catch (refreshError) {
      await clearAuthSession()
      return Promise.reject(refreshError)
    }
  },
)
