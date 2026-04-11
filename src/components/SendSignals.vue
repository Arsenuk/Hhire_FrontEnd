<template>
  <v-card class="post-card mb-4">
    <v-card-title>Sent Signals</v-card-title>

    <v-card-text>
      <v-list>
        <v-list-item v-for="signal in signals" :key="signal.id" class="signal-item" :ripple="false">
          <!-- Аватар -->
          <template #prepend>
            <v-avatar size="40" class="avatar">
              <v-img :src="getAvatarUrl(signal.receiver_avatar)" />
            </v-avatar>
          </template>

          <!-- Контент -->
          <div class="signal-content">
            <div class="signal-title">{{ signal.receiver_name }}</div>
            <div class="signal-message">{{ signal.message }}</div>
          </div>

          <!-- DELETE справа -->
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
  </v-card>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api/api.js'

const signals = ref([])

const fetchSignals = async () => {
  try {
    const res = await api.get('/signals/conversations/sent')
    signals.value = res.data.conversations
  } catch (err) {
    console.error('Failed to load sent signals', err)
  }
}

const deleteSignal = async (signal) => {
  if (!confirm('Delete this signal?')) return

  try {
    await api.delete(`/signals/${signal.id}`)
    signals.value = signals.value.filter(s => s.id !== signal.id)
  } catch (err) {
    console.error(err)
    alert('Failed to delete signal')
  }
}

const getAvatarUrl = (avatar) =>
  avatar || '/assets/default-avatar.png'

// 👇 NEW
const formatDate = (date) =>
  date ? new Date(date).toLocaleString() : ''

onMounted(fetchSignals)
</script>

<style scoped>
.post-card {
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  padding: 16px;
}

/* ITEM */
.signal-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  transition: all 0.2s ease;
  background: transparent;
}

/* hover */
.signal-item:hover {
  background: rgba(99, 102, 241, 0.06);
  transform: translateY(-1px);
}

/* AVATAR */
.avatar {
  border: 2px solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

/* TEXT */
.signal-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
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

/* DELETE BUTTON (справа + акуратний hover) */
.delete-btn {
  opacity: 0.4;
  transition: all 0.2s ease;
  color: #ef4444;
}

.signal-item:hover .delete-btn {
  opacity: 1;
  transform: scale(1.05);
}

.delete-btn:hover {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.08);
}

/* EMPTY */
.no-signal {
  color: #94a3b8;
  font-style: italic;
}
</style>
