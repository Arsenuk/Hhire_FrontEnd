import type { Pinia } from 'pinia'
import { useAuthStore } from '@/features/auth/model/auth.store'
import { clearSessionToken, getSessionToken, refreshSessionToken } from '@/shared/auth/session'

let initAuthPromise: Promise<void> | null = null

export function initAuth (pinia: Pinia): Promise<void> {
  if (!initAuthPromise) {
    initAuthPromise = (async () => {
      const authStore = useAuthStore(pinia)

      authStore.bindSession()
      authStore.hydrateUserFromStorage()

      if (!getSessionToken()) {
        try {
          await refreshSessionToken()
        } catch (error) {
          console.error('Failed to restore auth session from refresh token', error)
          authStore.setUser(null)
          clearSessionToken()
          return
        }
      }

      try {
        await authStore.fetchMe()
      } catch (error) {
        console.error('Failed to initialize auth session', error)
        authStore.setUser(null)
        clearSessionToken()
      }
    })()
  }

  return initAuthPromise
}

export function waitForAuthInitialization (): Promise<void> {
  return initAuthPromise ?? Promise.resolve()
}
