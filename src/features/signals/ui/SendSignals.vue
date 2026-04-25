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
          <template #prepend>
            <v-avatar class="avatar" size="40">
              <v-img :src="getAvatarUrl(signal.receiver_avatar)" />
            </v-avatar>
          </template>

          <div class="signal-content">
            <div class="signal-title">{{ signal.receiver_name }}</div>
            <div class="signal-message">{{ signal.message }}</div>
          </div>

          <template #append>
            <v-btn icon variant="text" class="delete-btn" @click="deleteSignal(signal)">
              <v-icon size="20">mdi-close</v-icon>
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
  import { useSendSignals } from '@/features/signals/model/useSendSignals.js'

  const {
    deleteSignal,
    getAvatarUrl,
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

.avatar {
  border: 2px solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.signal-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.signal-title {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
}

.signal-message {
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-btn {
  opacity: 0.5;
  transition: all 0.2s ease;
  color: #ef4444;
}

.signal-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.08);
}

.no-signal {
  color: #94a3b8;
  font-style: italic;
}
</style>
