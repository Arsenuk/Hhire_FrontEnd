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
            :user="signal.sender"
            @click="goToProfile(signal.sender.id)"
          />

          <template #append>
            <v-btn class="reply-btn" @click.stop="openDialog(signal)">
              Reply
            </v-btn>
          </template>
        </v-list-item>

        <div v-if="signals.length === 0" class="empty-state">
          No new signals
        </div>
      </v-list>
    </v-card-text>

    <v-dialog v-model="dialog" max-width="540px" persistent>
      <v-card class="reply-modal">
        <div class="reply-modal__toolbar">
          <div class="reply-modal__title">
            Reply to signal
          </div>

          <v-btn
            icon
            :ripple="false"
            class="toolbar-btn toolbar-btn--danger"
            title="Report"
            @click="reportSignal"
          >
            <v-icon>mdi-flag-outline</v-icon>
          </v-btn>

          <v-btn
            icon
            :ripple="false"
            class="toolbar-btn"
            title="Share contact info"
            @click="shareContactInfo"
          >
            <v-icon>mdi-account-box-outline</v-icon>
          </v-btn>

          <v-btn
            icon
            :ripple="false"
            class="toolbar-btn"
            title="Close window"
            @click="closeDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-card-text class="reply-modal__body">
          <div class="sender-row">
            <UserAvatar
              class="sender-avatar"
              :size="64"
              :user="activeSignal?.sender"
            />

            <div class="sender-name">
              {{ activeSignal?.sender?.name || 'User name' }}
            </div>
          </div>

          <div class="signal-content">
            {{ activeSignal?.message }}
          </div>

          <v-textarea
            v-model="replyMessage"
            class="reply-field"
            auto-grow
            hide-details
            label="Reply"
            rows="3"
            variant="outlined"
          />
        </v-card-text>

        <v-card-actions class="reply-modal__actions">
          <v-btn
            class="btn-refuse"
            prepend-icon="mdi-close-circle-outline"
            @click="respond('refuse')"
          >
            Refuse
          </v-btn>

          <v-btn
            class="btn-accept"
            prepend-icon="mdi-check-circle-outline"
            @click="respond('accept')"
          >
            Accept the offer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
  import UserAvatar from '@/entities/user/ui/UserAvatar.vue'
  import UserPreview from '@/entities/user/ui/UserPreview.vue'
  import { useUnrepliedSignals } from '@/features/signals/model/useUnrepliedSignals.js'

  const props = defineProps({
    updateNotify: {
      type: Function,
      default: undefined,
    },
  })

  const {
    activeSignal,
    closeDialog,
    dialog,
    goToProfile,
    openDialog,
    replyMessage,
    reportSignal,
    respond,
    shareContactInfo,
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
  position: relative;
}

.signal-item:hover {
  background: rgba(99, 102, 241, 0.06);
  transform: translateY(-1px);
}

:deep(.entity-user-preview__avatar) {
  border-radius: 14px;
  border: 2px solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease;
}

.signal-item:hover :deep(.entity-user-preview__avatar) {
  transform: scale(1.03);
}

.reply-btn {
  height: 34px;
  padding: 0 14px;
  border-radius: 12px !important;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: #ffffff;
  font-weight: 600;
  font-size: 12px;
  text-transform: none;
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.25);
  transition: all 0.25s ease;
}

.reply-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(99, 102, 241, 0.35);
}

.reply-btn:active {
  transform: scale(0.96);
}

.empty-state {
  text-align: center;
  color: #9ca3af;
  padding: 20px;
  font-style: italic;
  font-size: 13px;
}

.reply-modal {
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 24px !important;
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.94), #ffffff 38%),
    #ffffff;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.22);
  overflow: hidden;
}

.reply-modal__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  min-height: 68px;
  padding: 16px 18px 12px 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.22);
}

.reply-modal__title {
  min-width: 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.reply-modal__toolbar .toolbar-btn:first-of-type {
  margin-left: auto;
}

.toolbar-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px !important;
  color: #475569;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.26);
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  color: #0f172a;
  background: #ffffff;
  box-shadow:
    inset 0 0 0 1px rgba(99, 102, 241, 0.24),
    0 8px 20px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.toolbar-btn--danger:hover {
  color: #dc2626;
  box-shadow:
    inset 0 0 0 1px rgba(220, 38, 38, 0.22),
    0 8px 20px rgba(220, 38, 38, 0.08);
}

.reply-modal__body {
  padding: 24px;
}

.sender-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.sender-avatar {
  flex: 0 0 auto;
  border: 3px solid #ffffff;
  background: #f8fafc;
  box-shadow:
    0 10px 24px rgba(15, 23, 42, 0.12),
    0 0 0 1px rgba(148, 163, 184, 0.22);
}

.sender-name {
  min-width: 0;
  color: #0f172a;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.signal-content {
  display: flex;
  align-items: center;
  min-height: 124px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 18px;
  color: #1f2937;
  background:
    linear-gradient(135deg, rgba(238, 242, 255, 0.72), rgba(240, 253, 250, 0.72)),
    #f8fafc;
  font-size: 15px;
  line-height: 1.55;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
}

.reply-field {
  width: 100%;
  margin: 0 auto;
}

.reply-field :deep(.v-field) {
  min-height: 118px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
}

.reply-field :deep(.v-field__outline) {
  --v-field-border-width: 1px;
  color: rgba(99, 102, 241, 0.42);
}

.reply-field :deep(textarea) {
  color: #111827;
  line-height: 1.5;
}

.reply-modal__actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 0 24px 24px;
}

.btn-refuse,
.btn-accept {
  min-width: 148px;
  height: 44px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  text-transform: none;
  transition: all 0.2s ease;
}

.btn-refuse {
  color: #dc2626;
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px rgba(220, 38, 38, 0.5);
}

.btn-accept {
  color: #ffffff;
  background: linear-gradient(135deg, #10b981, #2563eb);
  box-shadow: 0 12px 26px rgba(37, 99, 235, 0.22);
}

.btn-refuse:hover {
  color: #b91c1c;
  background: #fef2f2;
  box-shadow:
    inset 0 0 0 1px rgba(220, 38, 38, 0.72),
    0 10px 22px rgba(220, 38, 38, 0.1);
  transform: translateY(-1px);
}

.btn-accept:hover {
  box-shadow: 0 16px 32px rgba(37, 99, 235, 0.28);
  transform: translateY(-1px);
}

@media (max-width: 520px) {
  .reply-modal__toolbar {
    padding: 14px;
  }

  .reply-modal__title {
    font-size: 16px;
  }

  .reply-modal__body {
    padding: 18px;
  }

  .sender-name {
    font-size: 20px;
  }

  .reply-modal__actions {
    flex-direction: column-reverse;
    padding: 0 18px 18px;
  }

  .btn-refuse,
  .btn-accept {
    width: 100%;
  }
}
</style>
