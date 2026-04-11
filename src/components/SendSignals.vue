<template>
  <v-list-item v-for="signal in signals" :key="signal.conversation_id" class="signal-item" :ripple="false">
    <!-- Аватар -->
    <template #prepend>
      <v-avatar size="44">
        <v-img :src="getAvatarUrl(signal.receiver_avatar)" />
      </v-avatar>
    </template>

    <!-- Контент -->
    <div class="signal-content">
      <div class="signal-header">
        <span class="signal-name">
          {{ signal.receiver_name || 'Unknown user' }}
        </span>

        <span class="signal-date">
          {{ formatDate(signal.last_message_at) }}
        </span>
      </div>

      <!-- SUBJECT -->
      <div class="signal-subject">
        {{ signal.subject || 'No subject' }}
      </div>

      <!-- MESSAGE -->
      <div class="signal-message">
        {{ signal.last_message }}
      </div>
    </div>

    <!-- Delete -->
    <v-btn icon class="delete-btn" @click="deleteSignal(signal)">
      <v-icon size="18">mdi-close</v-icon>
    </v-btn>
  </v-list-item>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useSignalStore } from '@/stores/signal.store'

const signalStore = useSignalStore()

const signals = computed(() => signalStore.sent)

onMounted(() => {
  signalStore.fetchSent()
})

// ---------------- DELETE ----------------
const deleteSignal = async (signal) => {
  if (!confirm('Delete this signal?')) return

  try {
    await signalStore.deleteSignal(signal.id) // 🔥 FIX
    await signalStore.fetchSent()             // 🔥 refresh
  } catch (err) {
    console.error('DELETE ERROR:', err)
  }
}

// ---------------- UTILS ----------------
const getAvatarUrl = (avatar) =>
  avatar
    ? `http://localhost:3000${avatar}`
    : '/assets/default-avatar.png'

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: 'short'
  })
}
</script>

<style scoped>
.signal-item {
  display: flex;
  align-items: center;
  gap: 14px;
  border-radius: 14px;
  padding: 12px 16px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.signal-item:hover {
  background-color: rgba(59, 130, 246, 0.08);
}

/* Контент */
.signal-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

/* Header (name + date) */
.signal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.signal-name {
  font-weight: 600;
  font-size: 14px;
  color: #0f172a;
}

.signal-date {
  font-size: 12px;
  color: #94a3b8;
}

/* Subject */
.signal-subject {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  margin-top: 2px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Message */
.signal-message {
  font-size: 12.5px;
  color: #64748b;
  margin-top: 2px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Delete */
.delete-btn {
  opacity: 0;
  transition: 0.2s;
}

.signal-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn {
  color: #ef4444;
}

.delete-btn:hover {
  color: #b91c1c;
}
</style>
