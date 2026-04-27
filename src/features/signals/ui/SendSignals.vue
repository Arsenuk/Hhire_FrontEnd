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
            :avatar-size="40"
            :subtitle="signal.message"
            :user="signal.receiver"
          />

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
  import UserPreview from '@/entities/user/ui/UserPreview.vue'
  import { useSendSignals } from '@/features/signals/model/useSendSignals.js'

  const {
    deleteSignal,
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
