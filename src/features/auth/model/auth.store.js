import { defineStore } from 'pinia'
import { loginRequest, logoutRequest } from '@/features/auth/api/auth.api.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: localStorage.getItem('accessToken') || null,
  }),
  getters: {
    isLoggedIn: state => !!state.accessToken,
  },
  actions: {
    async login (email, password) {
      try {
        const data = await loginRequest({ email, password })

        this.user = data.user
        this.accessToken = data.accessToken

        localStorage.setItem('accessToken', this.accessToken)
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Login failed')
      }
    },

    async logout () {
      try {
        await logoutRequest()

        this.user = null
        this.accessToken = null

        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
      } catch (error) {
        console.error('Logout failed', error)
      }
    },

    loadUserFromStorage () {
      const user = localStorage.getItem('user')
      const token = localStorage.getItem('accessToken')

      if (user && token) {
        this.user = JSON.parse(user)
        this.accessToken = token
        return
      }

      this.user = null
      this.accessToken = null
    },
  },
})
