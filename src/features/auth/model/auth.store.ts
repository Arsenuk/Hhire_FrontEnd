import { defineStore } from 'pinia'
import { normalizeUser } from '@/entities/user/lib/normalizeUser'
import { loginRequest, logoutRequest, meRequest } from '@/features/auth/api/auth.api'
import { clearAuthStorage, getAccessToken, setAccessToken as saveAccessToken } from '@/shared/api/tokenStorage'
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

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: getAccessToken(),
  }),
  getters: {
    isLoggedIn: state => !!state.accessToken,
  },
  actions: {
    setAccessToken (token: string | null | undefined) {
      this.accessToken = token || null
      saveAccessToken(token)
    },

    setUser (user: User | null) {
      this.user = user ? normalizeUser(user) : null

      if (this.user) {
        localStorage.setItem('user', JSON.stringify(this.user))
        return
      }

      localStorage.removeItem('user')
    },

    clearSession () {
      this.setUser(null)
      this.setAccessToken(null)
      clearAuthStorage()
    },

    async login (email: string, password: string) {
      try {
        const data = await loginRequest({ email, password })

        this.setUser(data.user)
        this.setAccessToken(data.accessToken)

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

    loadUserFromStorage () {
      const user = localStorage.getItem('user')
      const token = getAccessToken()

      if (user && token) {
        this.setUser(JSON.parse(user) as User)
        this.setAccessToken(token)
        return
      }

      this.clearSession()
    },
  },
})
