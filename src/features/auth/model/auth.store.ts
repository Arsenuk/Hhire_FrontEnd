import { defineStore } from 'pinia'
import { normalizeUser } from '@/entities/user/lib/normalizeUser'
import { loginRequest, logoutRequest, meRequest } from '@/features/auth/api/auth.api'
import { clearSessionToken, getSessionToken, setSessionToken, subscribeToSession } from '@/shared/auth/session'
import type { User } from '@/shared/types'

type ApiError = {
  response?: {
    data?: {
      error?: string
    }
  }
}

interface AuthState {
  user: User | null
  accessToken: string | null
}

const USER_STORAGE_KEY = 'user'

let stopSessionSync: (() => void) | null = null

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: getSessionToken(),
  }),
  getters: {
    isLoggedIn: state => !!state.accessToken,
  },
  actions: {
    bindSession () {
      if (stopSessionSync) {
        return
      }

      stopSessionSync = subscribeToSession(session => {
        this.accessToken = session.accessToken

        if (!session.accessToken) {
          this.setUser(null)
        }
      })
    },

    setAccessToken (token: string | null, rememberMe = true) {
      setSessionToken(token, rememberMe)
    },

    setUser (user: User | null) {
      this.user = user ? normalizeUser(user) : null

      if (this.user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(this.user))
        return
      }

      localStorage.removeItem(USER_STORAGE_KEY)
    },

    clearSession () {
      this.setUser(null)
      clearSessionToken()
    },

    async login (email: string, password: string, rememberMe = true) {
      try {
        const data = await loginRequest({ email, password, rememberMe })

        this.setUser(data.user)
        this.setAccessToken(data.accessToken, rememberMe)

        await this.fetchMe()
      } catch (error) {
        const apiError = error as ApiError

        throw new Error(apiError.response?.data?.error || 'Login failed')
      }
    },

    async fetchMe () {
      const user = await meRequest()
      this.setUser(user)

      return this.user
    },

    async logout () {
      try {
        await logoutRequest()
      } catch (error) {
        console.error('Logout failed', error)
      } finally {
        this.clearSession()
      }
    },

    hydrateUserFromStorage () {
      const user = localStorage.getItem(USER_STORAGE_KEY)

      if (!user) {
        this.user = null
        return
      }

      try {
        this.user = normalizeUser(JSON.parse(user))
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY)
        this.user = null
      }
    },
  },
})
