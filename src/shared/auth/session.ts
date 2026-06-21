import axios from 'axios'
import { clearAccessToken, getStoredAccessToken, setAccessToken } from '@/shared/api/tokenStorage'
import { API_BASE_URL } from '@/shared/config/api'
import type { RefreshResponse } from '@/shared/types'

export type SessionState = {
  accessToken: string | null
}

type SessionListener = (session: SessionState) => void

const listeners = new Set<SessionListener>()

const storedToken = getStoredAccessToken()

let accessToken = storedToken.token
let rememberMe = storedToken.rememberMe
let refreshPromise: Promise<string> | null = null

function getSessionState (): SessionState {
  return {
    accessToken,
  }
}

function notifySessionListeners (): void {
  const session = getSessionState()

  listeners.forEach(listener => listener(session))
}

export function getSessionToken (): string | null {
  return accessToken
}

export function setSessionToken (token: string | null, nextRememberMe?: boolean): void {
  const nextToken = token || null

  if (typeof nextRememberMe === 'boolean') {
    rememberMe = nextRememberMe
  }

  accessToken = nextToken
  setAccessToken(nextToken, rememberMe)
  notifySessionListeners()
}

export function clearSessionToken (): void {
  accessToken = null
  rememberMe = true
  clearAccessToken()
  notifySessionListeners()
}

export function subscribeToSession (listener: SessionListener): () => void {
  listeners.add(listener)
  listener(getSessionState())

  return () => {
    listeners.delete(listener)
  }
}

export async function refreshSessionToken (): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios.post<RefreshResponse>(`${API_BASE_URL}/auth/refresh`, null, {
      withCredentials: true,
    })
      .then(response => {
        const nextToken = response.data?.accessToken
        const nextRememberMe = response.data?.rememberMe

        if (!nextToken) {
          throw new Error('Refresh response does not include access token')
        }

        setSessionToken(nextToken, nextRememberMe)
        return nextToken
      })
      .catch(error => {
        clearSessionToken()
        throw error
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}
