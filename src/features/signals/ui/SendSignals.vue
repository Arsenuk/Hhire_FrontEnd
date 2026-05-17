<template>
  <v-card class="post-card mb-4">
    <v-card-title>Sent Signals</v-card-title>

    <v-card-text>
      <v-list>
        <v-list-item
          v-for="signal in signals"
          :key="signal.id"
          class="signal-item"
          :ripple="false"
        >
          <UserPreview
            clickable
            :avatar-size="40"
            :subtitle="signal.message"
            :user="signal.counterpart"
            @click="goToProfile(signal.counterpart.id)"
          />

          <template #append>
            <v-btn class="view-btn" @click="openDialog(signal)">
              View
            </v-btn>
          </template>
        </v-list-item>

        <v-list-item v-if="signals.length === 0">
          <v-list-item-title class="no-signal">
            No sent signals
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>

    <ConversationDialog
      v-model="dialog"
      :can-close-conversation="canCloseConversation"
      :can-hide="canHide"
      :close-loading="closeLoading"
      :contact-info-shared-with-me="activeSignal?.contactInfoSharedWithMe"
      :conversation="activeSignal"
      :current-user-id="currentUserId"
      :hide-loading="hideLoading"
      :is-awaiting-my-close-confirmation="isAwaitingMyCloseConfirmation"
      :loading="loadingConversation"
      :messages="messages"
      :own-contacts-shared="activeSignal?.ownContactsShared"
      :share-loading="shareLoading"
      :shared-contacts="sharedContacts"
      :shared-contacts-loading="sharedContactsLoading"
      @close="closeDialog"
      @close-conversation="closeConversation"
      @go-profile="goToProfile"
      @hide-conversation="hideConversation"
      @load-contacts="fetchSharedContacts"
      @report="reportSignal"
      @toggle-share="shareContactInfo"
    />

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="bottom"
      multi-line
      rounded="pill"
      timeout="2500"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-card>
</template>

<script setup>
  import UserPreview from '@/entities/user/ui/UserPreview.vue'
  import { useSendSignals } from '@/features/signals/model/useSendSignals.js'
  import ConversationDialog from '@/features/signals/ui/ConversationDialog.vue'

  const {
    activeSignal,
    canCloseConversation,
    canHide,
    isAwaitingMyCloseConfirmation,
    closeConversation,
    closeDialog,
    closeLoading,
    currentUserId,
    dialog,
    fetchSharedContacts,
    goToProfile,
    hideConversation,
    hideLoading,
    loadingConversation,
    messages,
    openDialog,
    reportSignal,
    shareContactInfo,
    shareLoading,
    sharedContacts,
    sharedContactsLoading,
    signals,
    snackbar,
  } = useSendSignals()
</script>

<style scoped>
.post-card {
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  padding: 16px;
}

.signal-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  transition: all 0.2s ease;
}

.signal-item:hover {
  background: rgba(99, 102, 241, 0.06);
  transform: translateY(-1px);
}

:deep(.entity-user-preview__avatar) {
  border: 2px solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.view-btn {
  height: 34px;
  padding: 0 14px;
  border-radius: 12px !important;
  background: linear-gradient(90deg, #d3ffad, #97e5ee);
  color: #000000;
  font-weight: 600;
  font-size: 12px;
  text-transform: none;
}

.no-signal {
  color: #94a3b8;
  font-style: italic;
}
</style>
