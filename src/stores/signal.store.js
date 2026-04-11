import { defineStore } from 'pinia'
import { api } from '@/api/api.js'


export const useSignalStore = defineStore('signal', {
  state: () => ({
    sent: [],
    inbox: [],
    loading: false
  }),

  actions: {
    // ---------------- SENT ----------------
    async fetchSent() {
      try {
        this.loading = true

        const res = await api.get('/signals/conversations/sent')

        this.sent = res.data.conversations || res.data
      } catch (err) {
        console.error('fetchSent error', err)
      } finally {
        this.loading = false
      }
    },

    // ---------------- INBOX ----------------
    async fetchInbox() {
      try {
        this.loading = true

        const res = await api.get('/signals/conversations/inbox?unread=true')

        this.inbox = res.data.conversations || res.data
      } catch (err) {
        console.error('fetchInbox error', err)
      } finally {
        this.loading = false
      }
    },

    // ---------------- REPLY ----------------
    async reply(signalId, message) {
      await api.post(`/signals/${signalId}/reply`, {
        message
      })

      // 🔥 після reply ОБОВʼЯЗКОВО оновлюємо обидва списки
      await Promise.all([
        this.fetchInbox(),
        this.fetchSent()
      ])
    },

    // ---------------- DELETE ----------------
    async deleteSignal(signalId) {
      await api.delete(`/signals/${signalId}`)

      this.sent = this.sent.filter(s => s.id !== signalId)
      this.inbox = this.inbox.filter(s => s.id !== signalId)
    }
  }
})