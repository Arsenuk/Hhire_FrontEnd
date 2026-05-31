<template>
  <v-card class="post-card mb-4">
    <v-card-title class="title">Suggested Users</v-card-title>

    <v-card-text class="card-body">
      <v-list class="list">
        <v-list-item
          v-for="(user, index) in suggestedUsers"
          :key="user.id ?? `suggested-user-${index}`"
          class="user-item"
          :ripple="false"
        >
          <UserPreview
            class="left"
            clickable
            :avatar-size="48"
            :subtitle="user.description || 'No description'"
            :user="user"
            @click="goToProfile(user.id)"
          />

          <div class="right">
            <v-btn class="connect-btn" variant="flat" @click.stop="openConnectDialog(user)">
              Connect
            </v-btn>
          </div>
        </v-list-item>
      </v-list>
    </v-card-text>

    <SendSignalDialog
      v-model="dialog"
      :context-copy="'Introduce yourself and start a conversation.'"
      context-label="Connect"
      :loading="sendLoading"
      :primary-action-label="'Send signal'"
      :target-user="selectedUser"
      :title="'Send Signal'"
      @close="closeDialog"
      @submit="sendSignal"
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
  import { useSuggestedUsers } from '@/features/signals/model/useSuggestedUsers'
  import SendSignalDialog from '@/features/signals/ui/SendSignalDialog.vue'

  const {
    closeDialog,
    dialog,
    goToProfile,
    openConnectDialog,
    selectedUser,
    sendSignal,
    sendLoading,
    snackbar,
    suggestedUsers,
  } = useSuggestedUsers()
</script>

<style scoped>
.post-card {
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.06);
  padding: 16px;
  transition: all 0.2s ease;
}

.post-card:hover {
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.08);
}

.title {
  font-weight: 700;
  font-size: 16px;
  color: #111827;
  letter-spacing: 0.3px;
}

.list {
  padding: 0;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  border-radius: 16px;
  margin-bottom: 10px;
  background: transparent;
  transition: all 0.25s ease;
}

.user-item:hover {
  background: rgba(99, 102, 241, 0.06);
  transform: translateY(-1px);
}

.left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  padding: 12px 14px;
  cursor: pointer;
  min-width: 0;
}

:deep(.entity-user-preview__avatar) {
  border-radius: 14px;
  border: 2px solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease;
}

.user-item:hover :deep(.entity-user-preview__avatar) {
  transform: scale(1.03);
}

.right {
  display: flex;
  align-items: center;
  padding-right: 14px;
}

.connect-btn {
  height: 36px;
  padding: 0 18px;
  border-radius: 14px !important;
  background: linear-gradient(135deg, #9BFF43, #31EAFF);
  color: #000000;
  font-weight: 600;
  font-size: 13px;
  text-transform: none;
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.25);
  transition: all 0.25s ease;
}

.connect-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(99, 102, 241, 0.35);
}

.connect-btn:active {
  transform: scale(0.97);
}

:deep(.v-snackbar) {
  border-radius: 12px;
  font-weight: 500;
}
</style>
