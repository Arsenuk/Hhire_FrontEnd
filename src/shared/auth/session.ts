import axios from 'axios'
import { clearAccessToken, getAccessToken, setAccessToken } from '@/shared/api/tokenStorage'
import { API_BASE_URL } from '@/shared/config/api'
import type { RefreshResponse } from '@/shared/types'

export type SessionState = {
  accessToken: string | null
}

type SessionListener = (session: SessionState) => void

const listeners = new Set<SessionListener>()

let accessToken = getAccessToken()
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

export function setSessionToken (token: string | null | undefined): void {
  const nextToken = token || null

  accessToken = nextToken
  setAccessToken(nextToken)
  notifySessionListeners()
}

export function clearSessionToken (): void {
  accessToken = null
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

        if (!nextToken) {
          throw new Error('Refresh response does not include access token')
        }

        setSessionToken(nextToken)
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
