import { defineStore } from 'pinia'

export type ContactsTabKey = 'follows' | 'suggested' | 'unreplied' | 'send'

export const useContactsUiStore = defineStore('contactsUi', {
  state: () => ({
    currentTab: 'follows' as ContactsTabKey,
    profileSearchQuery: '',
    conversationSearchQuery: '',
  }),
  actions: {
    setCurrentTab(tab: ContactsTabKey) {
      this.currentTab = tab
    },
    setProfileSearchQuery(value: string) {
      this.profileSearchQuery = value
    },
    setConversationSearchQuery(value: string) {
      this.conversationSearchQuery = value
    },
    clearProfileSearchQuery() {
      this.profileSearchQuery = ''
    },
    clearConversationSearchQuery() {
      this.conversationSearchQuery = ''
    },
  },
})
