import { defineStore } from 'pinia'

export const useFeedControlsStore = defineStore('feedControls', {
  state: () => ({
    mobileControlsOpen: false,
  }),
  actions: {
    openMobileControls () {
      this.mobileControlsOpen = true
    },
    closeMobileControls () {
      this.mobileControlsOpen = false
    },
    toggleMobileControls () {
      this.mobileControlsOpen = !this.mobileControlsOpen
    },
  },
})
