import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/shared/config/api'
import { getSessionToken, refreshSessionToken } from '@/shared/auth/session'

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

type ApiErrorPayload = {
  error?: string
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

function shouldSkipRefresh (url = ''): boolean {
  return [
    '/auth/login',
    '/auth/register',
    '/auth/logout',
    '/auth/refresh',
  ].some(authUrl => url.includes(authUrl))
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getSessionToken()

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
      const accessToken = await refreshSessionToken()

      if (typeof originalRequest.headers?.set === 'function') {
        originalRequest.headers.set('Authorization', `Bearer ${accessToken}`)
      }

      return api(originalRequest)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  },
)
