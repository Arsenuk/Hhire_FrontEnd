import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: localStorage.getItem('accessToken') || null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.accessToken
  },
  actions: {
    async login(email, password) {
      try {
        const res = await axios.post(
          'http://localhost:3000/api/auth/login',
          { email, password },
          { withCredentials: true }
        )

        this.user = res.data.user
        this.accessToken = res.data.accessToken

        localStorage.setItem('accessToken', this.accessToken)
        localStorage.setItem('user', JSON.stringify(this.user))

      } catch (err) {
        throw new Error(err.response?.data?.error || 'Login failed')
      }
    },

    async logout() {
      try {
        await axios.post(
          'http://localhost:3000/api/auth/logout',
          {},
          { withCredentials: true }
        )

        this.user = null
        this.accessToken = null

        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
      } catch (err) {
        console.error('Logout failed', err)
      }
    },

    loadUserFromStorage() {
      const user = localStorage.getItem('user')
      const token = localStorage.getItem('accessToken')
      if (user && token) {
        this.user = JSON.parse(user)
        this.accessToken = token
      } else {
        this.user = null
        this.accessToken = null
      }
    }
  }
})
