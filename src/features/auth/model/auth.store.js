import { defineStore } from 'pinia'
import { normalizeUser } from '@/entities/user/lib/normalizeUser.js'
import { loginRequest, logoutRequest, meRequest } from '@/features/auth/api/auth.api.js'
import { clearAuthStorage, getAccessToken, setAccessToken as saveAccessToken } from '@/shared/api/tokenStorage.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: getAccessToken(),
  }),
  getters: {
    isLoggedIn: state => !!state.accessToken,
  },
  actions: {
    setAccessToken (token) {
      this.accessToken = token || null
      saveAccessToken(token)
    },

    setUser (user) {
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

    async login (email, password) {
      try {
        const data = await loginRequest({ email, password })

        this.setUser(data.user)
        this.setAccessToken(data.accessToken)

        await this.fetchMe()
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Login failed')
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
        this.setUser(JSON.parse(user))
        this.setAccessToken(token)
        return
      }

      this.clearSession()
    },
  },
})
