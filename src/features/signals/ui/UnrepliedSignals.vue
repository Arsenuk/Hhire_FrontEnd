<template>
  <v-card class="post-card mb-4">
    <v-card-title class="card-title">
      Unreplied Signals
    </v-card-title>

    <v-card-text class="card-body">
      <v-list class="signal-list">
        <v-list-item
          v-for="signal in signals"
          :key="signal.id"
          class="signal-item"
          :ripple="false"
        >
          <UserPreview
            clickable
            :avatar-size="46"
            :subtitle="signal.message"
            :user="signal.counterpart"
            @click="goToProfile(signal.counterpart.id)"
          />

          <template #append>
            <v-btn class="reply-btn" @click.stop="openDialog(signal)">
              {{ signal.status === 'open' ? 'Reply' : 'View' }}
            </v-btn>
          </template>
        </v-list-item>

        <div v-if="signals.length === 0" class="empty-state">
          No new signals
        </div>
      </v-list>
    </v-card-text>

    <ConversationDialog
      v-model="dialog"
      :can-close-conversation="canCloseConversation"
      :can-hide="canHide"
      :can-reply="canReply"
      :close-loading="closeLoading"
      :contact-info-shared-with-me="activeSignal?.contactInfoSharedWithMe"
      :conversation="activeSignal"
      :current-user-id="currentUserId"
      :hide-loading="hideLoading"
      :is-awaiting-my-close-confirmation="isAwaitingMyCloseConfirmation"
      :loading="loadingConversation"
      :messages="messages"
      :own-contacts-shared="activeSignal?.ownContactsShared"
      :reply-loading="replyLoading"
      :report-loading="reportLoading"
      :share-loading="shareLoading"
      :shared-contacts="sharedContacts"
      :shared-contacts-loading="sharedContactsLoading"
      @close="closeDialog"
      @close-conversation="closeConversation"
      @go-profile="goToProfile"
      @hide-conversation="hideConversation"
      @load-contacts="fetchSharedContacts"
      @reply="respond"
      @report-submit="reportSignal"
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

<script setup lang="ts">
  import UserPreview from '@/entities/user/ui/UserPreview.vue'
  import { useUnrepliedSignals } from '@/features/signals/model/useUnrepliedSignals'
  import ConversationDialog from '@/features/signals/ui/ConversationDialog.vue'

  const props = defineProps<{
    updateNotify?: (count: number) => void
  }>()

  const {
    activeSignal,
    canCloseConversation,
    canHide,
    isAwaitingMyCloseConfirmation,
    canReply,
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
    replyLoading,
    reportLoading,
    reportSignal,
    respond,
    shareContactInfo,
    shareLoading,
    sharedContacts,
    sharedContactsLoading,
    signals,
    snackbar,
  } = useUnrepliedSignals(props.updateNotify)
</script>

<style scoped>
.post-card {
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  padding: 14px;
  transition: all 0.2s ease;
}

.post-card:hover {
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-weight: 800;
  font-size: 18px;
  color: #111827;
  letter-spacing: 0.3px;
}

.signal-list {
  padding: 0;
}

.signal-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 10px;
  border-radius: 14px;
  transition: all 0.25s ease;
}

.signal-item:hover {
  background: rgba(99, 102, 241, 0.06);
  transform: translateY(-1px);
}

:deep(.entity-user-preview__avatar) {
  border-radius: 14px;
  border: 2px solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
}

.reply-btn {
  height: 34px;
  padding: 0 14px;
  border-radius: 12px !important;
  background: linear-gradient(90deg, #d3ffad, #97e5ee);
  color: #000000;
  font-weight: 600;
  font-size: 12px;
  text-transform: none;
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.25);
}

.empty-state {
  text-align: center;
  color: #9ca3af;
  padding: 20px;
  font-style: italic;
  font-size: 13px;
}
</style>
