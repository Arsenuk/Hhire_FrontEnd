import { defineStore } from 'pinia'

export const useFeedSearchStore = defineStore('feedSearch', {
  state: () => ({
    query: '',
  }),
  actions: {
    setQuery(value: string) {
      this.query = value
    },
    clearQuery() {
      this.query = ''
    },
  },
})
