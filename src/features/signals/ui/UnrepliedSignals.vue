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
          <template #prepend>
            <v-avatar class="avatar" size="46" @click.stop="goToProfile(signal.sender_id)">
              <v-img :src="getAvatarUrl(signal.sender_avatar)" />
            </v-avatar>
          </template>

          <div class="signal-content">
            <div class="signal-name">
              {{ signal.sender_name }}
            </div>

            <div class="signal-message">
              {{ signal.message }}
            </div>
          </div>

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

    <v-dialog v-model="dialog" max-width="520px" persistent>
      <v-card class="modal-card">
        <v-card-title class="modal-title">
          Signal from {{ activeSignal?.sender_name }}

          <v-btn icon class="close-btn" @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="modal-body">
          <div class="message-box">
            {{ activeSignal?.message }}
          </div>

          <v-textarea
            v-model="replyMessage"
            auto-grow
            label="Write your reply"
            rows="3"
            variant="outlined"
          />
        </v-card-text>

        <v-card-actions class="modal-actions">
          <v-btn class="btn-refuse" @click="closeDialog">
            Refuse
          </v-btn>

          <v-btn class="btn-send" @click="respond('sing')">
            Send & Follow
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
    getAvatarUrl,
    goToProfile,
    openDialog,
    replyMessage,
    respond,
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

.avatar {
  border-radius: 14px;
  border: 2px solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.signal-item:hover .avatar {
  transform: scale(1.03);
}

.signal-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.signal-name {
  font-weight: 700;
  font-size: 14px;
  color: #111827;
  margin-bottom: 2px;
}

.signal-message {
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
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

.modal-card {
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.18);
  padding: 8px;
}

.modal-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 800;
  font-size: 16px;
  color: #111827;
  padding: 10px 14px;
}

.close-btn {
  color: #6b7280;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #111827;
  transform: rotate(90deg);
}

.message-box {
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #111827;
}

:deep(.v-textarea) {
  border-radius: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 14px 14px;
}

.btn-refuse {
  background: #f3f4f6;
  color: #111827;
  font-weight: 600;
  border-radius: 12px;
  text-transform: none;
}

.btn-refuse:hover {
  background: #e5e7eb;
}

.btn-send {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #ffffff;
  font-weight: 600;
  border-radius: 12px;
  text-transform: none;
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.25);
}

.btn-send:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(34, 197, 94, 0.35);
}
</style>
