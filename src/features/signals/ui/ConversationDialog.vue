<template>
  <v-dialog :model-value="modelValue" max-width="760px" persistent @update:model-value="handleDialogToggle">
    <v-card class="conversation-dialog">
      <div class="conversation-dialog__toolbar">
        <div class="conversation-dialog__title">
          <div class="title-main">
            {{ canReply ? 'Reply to signal' : 'Conversation details' }}
          </div>

          <div class="title-meta">
            <span class="status-chip" :class="`status-chip--${conversation?.status || 'open'}`">
              {{ conversation?.status || 'open' }}
            </span>
            <span v-if="conversation?.outcome && conversation.outcome !== 'pending'" class="outcome-chip">
              {{ conversation.outcome }}
            </span>
          </div>
        </div>

        <v-btn
          icon
          :ripple="false"
          class="toolbar-btn toolbar-btn--danger"
          title="Report"
          @click="reportDialog = true"
        >
          <v-icon>mdi-flag-outline</v-icon>
        </v-btn>

        <v-btn
          icon
          :disabled="shareLoading"
          :ripple="false"
          class="toolbar-btn"
          :title="ownContactsShared ? 'Hide my contact info' : 'Share my contact info'"
          @click="$emit('toggle-share', !ownContactsShared)"
        >
          <v-icon>{{ ownContactsShared ? 'mdi-account-off-outline' : 'mdi-account-box-outline' }}</v-icon>
        </v-btn>

        <v-btn
          icon
          :disabled="!contactInfoSharedWithMe"
          :ripple="false"
          class="toolbar-btn"
          title="View shared contacts"
          @click="openContactsDialog"
        >
          <v-icon>mdi-card-account-details-outline</v-icon>
        </v-btn>

        <v-btn
          icon
          :ripple="false"
          class="toolbar-btn"
          title="Close window"
          @click="$emit('close')"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card-text class="conversation-dialog__body">
        <div class="counterpart-row">
          <button class="counterpart-button" type="button" @click="$emit('go-profile', conversation?.counterpart?.id)">
            <UserAvatar
              class="counterpart-avatar"
              :size="62"
              :user="conversation?.counterpart"
            />

            <div class="counterpart-info">
              <div class="counterpart-name">
                {{ conversation?.counterpart?.name || 'User' }}
              </div>
              <div class="counterpart-subtitle">
                {{ contactInfoSharedWithMe ? 'Shared contacts available' : 'Contacts are hidden for now' }}
              </div>
            </div>
          </button>
        </div>

        <div class="thread-panel">
          <div v-if="loading" class="thread-state">
            Loading conversation...
          </div>

          <div v-else-if="messages.length === 0" class="thread-state">
            No messages yet
          </div>

          <div v-else class="thread-list">
            <div
              v-for="item in messages"
              :key="item.id"
              class="thread-bubble"
              :class="{ 'thread-bubble--mine': item.sender?.id === currentUserId }"
            >
              <div class="thread-bubble__author">
                {{ item.sender?.name || 'User' }}
              </div>
              <div class="thread-bubble__message">
                {{ item.message }}
              </div>
            </div>
          </div>
        </div>

        <v-textarea
          v-if="canReply"
          v-model="replyMessage"
          class="reply-field"
          auto-grow
          hide-details
          label="Reply"
          rows="3"
          variant="outlined"
        />
      </v-card-text>

      <v-card-actions class="conversation-dialog__actions">
        <v-btn
          v-if="canHide"
          class="btn-secondary"
          :loading="hideLoading"
          prepend-icon="mdi-eye-off-outline"
          @click="$emit('hide-conversation')"
        >
          Hide in my list
        </v-btn>

        <v-btn
          v-else-if="canCloseConversation"
          class="btn-secondary"
          :loading="closeLoading"
          :prepend-icon="isAwaitingMyCloseConfirmation ? 'mdi-check-all' : 'mdi-timer-sand'"
          @click="$emit('close-conversation')"
        >
          {{ isAwaitingMyCloseConfirmation ? 'Confirm finish' : 'Request finish' }}
        </v-btn>

        <div class="actions-spacer" />

        <template v-if="canReply">
          <v-btn
            class="btn-refuse"
            :loading="replyLoading"
            prepend-icon="mdi-close-circle-outline"
            @click="$emit('reply', { action: 'refuse', message: replyMessage })"
          >
            Refuse
          </v-btn>

          <v-btn
            class="btn-accept"
            :loading="replyLoading"
            prepend-icon="mdi-check-circle-outline"
            @click="$emit('reply', { action: 'accept', message: replyMessage })"
          >
            Send reply
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="contactsDialog" max-width="520px">
      <v-card class="contacts-dialog">
        <v-card-title class="contacts-dialog__title">
          Shared contacts
        </v-card-title>

        <v-card-text>
          <div v-if="sharedContactsLoading" class="thread-state">
            Loading contacts...
          </div>

          <div v-else-if="sharedContacts.length === 0" class="thread-state">
            No shared contacts yet
          </div>

          <v-list v-else class="contacts-list">
            <v-list-item
              v-for="contact in sharedContacts"
              :key="contact.id"
              :href="contact.url"
              rel="noopener noreferrer"
              target="_blank"
            >
              <v-list-item-title>{{ contact.description }}</v-list-item-title>
              <v-list-item-subtitle>{{ contact.type }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions class="contacts-dialog__actions">
          <v-btn class="btn-secondary" @click="contactsDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="reportDialog" max-width="520px">
      <v-card class="report-dialog">
        <v-card-title class="report-dialog__title">
          Report signal
        </v-card-title>

        <v-card-text class="report-dialog__body">
          <p class="report-dialog__copy">
            Tell us what is wrong with this signal. The report will be sent to moderation.
          </p>

          <v-select
            v-model="reportTags"
            :items="reportReasons"
            chips
            item-title="label"
            item-value="value"
            label="Reason"
            multiple
            variant="outlined"
          />
        </v-card-text>

        <v-card-actions class="report-dialog__actions">
          <v-btn class="btn-secondary" :disabled="reportLoading" @click="closeReportDialog">
            Cancel
          </v-btn>

          <v-btn
            class="btn-report"
            :disabled="!reportTags.length"
            :loading="reportLoading"
            prepend-icon="mdi-flag-outline"
            @click="submitReport"
          >
            Send report
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
  import { ref, watch } from 'vue'
  import UserAvatar from '@/entities/user/ui/UserAvatar.vue'

  const emit = defineEmits([
    'close',
    'close-conversation',
    'go-profile',
    'hide-conversation',
    'load-contacts',
    'reply',
    'report-submit',
    'toggle-share',
    'update:modelValue',
  ])

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    conversation: {
      type: Object,
      default: null,
    },
    messages: {
      type: Array,
      default: () => [],
    },
    currentUserId: {
      type: [Number, String],
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    canReply: {
      type: Boolean,
      default: false,
    },
    ownContactsShared: {
      type: Boolean,
      default: false,
    },
    contactInfoSharedWithMe: {
      type: Boolean,
      default: false,
    },
    sharedContacts: {
      type: Array,
      default: () => [],
    },
    sharedContactsLoading: {
      type: Boolean,
      default: false,
    },
    replyLoading: {
      type: Boolean,
      default: false,
    },
    shareLoading: {
      type: Boolean,
      default: false,
    },
    hideLoading: {
      type: Boolean,
      default: false,
    },
    closeLoading: {
      type: Boolean,
      default: false,
    },
    canHide: {
      type: Boolean,
      default: false,
    },
    canCloseConversation: {
      type: Boolean,
      default: false,
    },
    isAwaitingMyCloseConfirmation: {
      type: Boolean,
      default: false,
    },
    reportLoading: {
      type: Boolean,
      default: false,
    },
  })

  const replyMessage = ref('')
  const contactsDialog = ref(false)
  const reportDialog = ref(false)
  const reportTags = ref(['other'])
  const reportReasons = [
    { label: 'Spam', value: 'spam' },
    { label: 'Harassment', value: 'harassment' },
    { label: 'Scam or fraud', value: 'scam' },
    { label: 'Privacy violation', value: 'privacy_violation' },
    { label: 'Impersonation', value: 'impersonation' },
    { label: 'Other', value: 'other' },
  ]

  function handleDialogToggle (value) {
    emit('update:modelValue', value)
    if (!value) {
      emit('close')
    }
  }

  function openContactsDialog () {
    if (!props.contactInfoSharedWithMe) {
      return
    }

    contactsDialog.value = true
    emit('load-contacts')
  }

  function closeReportDialog () {
    if (props.reportLoading) {
      return
    }

    reportDialog.value = false
    reportTags.value = ['other']
  }

  function submitReport () {
    emit('report-submit', {
      tags: reportTags.value,
      onDone: closeReportDialog,
    })
  }

  watch(() => props.modelValue, value => {
    if (!value) {
      replyMessage.value = ''
      contactsDialog.value = false
      closeReportDialog()
    }
  })

  watch(() => props.conversation?.id, () => {
    replyMessage.value = ''
    contactsDialog.value = false
    closeReportDialog()
  })
</script>

<style scoped>
.conversation-dialog {
  border-radius: 24px !important;
  overflow: hidden;
}

.conversation-dialog__toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 22px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.conversation-dialog__title {
  min-width: 0;
}

.title-main {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.title-meta {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.status-chip,
.outcome-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize;
}

.status-chip--open {
  background: rgba(34, 197, 94, 0.14);
  color: #166534;
}

.status-chip--closed {
  background: rgba(148, 163, 184, 0.16);
  color: #334155;
}

.outcome-chip {
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
}

.toolbar-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px !important;
}

.toolbar-btn:first-of-type {
  margin-left: auto;
}

.toolbar-btn--danger {
  color: #dc2626;
}

.conversation-dialog__body {
  padding: 22px;
}

.counterpart-row {
  margin-bottom: 18px;
}

.counterpart-button {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.counterpart-avatar {
  flex: 0 0 auto;
}

.counterpart-name {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.counterpart-subtitle {
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
}

.thread-panel {
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.92), #ffffff);
  padding: 16px;
  min-height: 220px;
  margin-bottom: 18px;
}

.thread-state {
  color: #64748b;
  text-align: center;
  padding: 36px 12px;
}

.thread-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.thread-bubble {
  max-width: 88%;
  align-self: flex-start;
  background: #eef2ff;
  border-radius: 16px 16px 16px 6px;
  padding: 12px 14px;
}

.thread-bubble--mine {
  align-self: flex-end;
  background: #dcfce7;
  border-radius: 16px 16px 6px 16px;
}

.thread-bubble__author {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 4px;
}

.thread-bubble__message {
  color: #0f172a;
  white-space: pre-wrap;
  word-break: break-word;
}

.reply-field :deep(.v-field) {
  border-radius: 16px;
}

.conversation-dialog__actions {
  display: flex;
  gap: 10px;
  padding: 0 22px 22px;
}

.actions-spacer {
  flex: 1;
}

.btn-secondary,
.btn-refuse,
.btn-accept {
  text-transform: none;
  font-weight: 700;
  border-radius: 14px;
}

.btn-secondary {
  color: #0f172a;
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.35);
}

.btn-refuse {
  color: #dc2626;
  background: #fef2f2;
}

.btn-accept {
  color: #000000;
  background: linear-gradient(135deg, #9bff43, #31eaff);
}

.contacts-dialog {
  border-radius: 20px !important;
}

.contacts-dialog__title {
  font-weight: 800;
}

.contacts-list {
  padding: 0;
}

.contacts-dialog__actions {
  justify-content: flex-end;
  padding: 0 16px 16px;
}

.report-dialog {
  border-radius: 20px !important;
}

.report-dialog__title {
  font-weight: 800;
}

.report-dialog__body {
  display: grid;
  gap: 14px;
}

.report-dialog__copy {
  color: #64748b;
  margin: 0;
}

.report-dialog__actions {
  justify-content: flex-end;
  padding: 0 16px 16px;
}

.btn-report {
  color: #ffffff;
  background: linear-gradient(135deg, #dc2626, #f97316);
}

@media (max-width: 640px) {
  .conversation-dialog__toolbar,
  .conversation-dialog__body,
  .conversation-dialog__actions {
    padding-left: 16px;
    padding-right: 16px;
  }

  .conversation-dialog__actions {
    flex-wrap: wrap;
  }

  .actions-spacer {
    display: none;
  }

  .btn-secondary,
  .btn-refuse,
  .btn-accept {
    width: 100%;
  }
}
</style>
