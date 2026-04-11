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
          <!-- Аватарка отримувача -->
          <template #prepend>
            <v-avatar size="40">
              <v-img :src="getAvatarUrl(signal.receiver_avatar)" />
            </v-avatar>
          </template>

          <!-- Контент сигналу -->
          <div class="signal-content">
            <div class="signal-title">{{ signal.receiver_name }}</div>
            <div class="signal-message">{{ signal.message }}</div>
          </div>

          <!-- Кнопка видалення -->
          <v-btn
            icon
            class="delete-btn"
            @click="deleteSignal(signal)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-list-item>

        <v-list-item v-if="signals.length === 0">
          <v-list-item-title class="no-signal">No sent signals</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '@/api/api.js';

const signals = ref([]);

const fetchSignals = async () => {
  try {
    const res = await api.get('/signals/conversations/sent');
    
    console.log('SENT:', res.data);

    signals.value = res.data.conversations; // 🔥 ОСЬ ЦЕ ТИ ЗАБУВ
  } catch (err) {
    console.error('Failed to load sent signals', err);
  }
};
const deleteSignal = async (signal) => {
  if (!confirm('Delete this signal?')) return;

  try {
    await api.delete(`/signals/${signal.id}`);
    signals.value = signals.value.filter(s => s.id !== signal.id);
  } catch (err) {
    console.error(err);
    alert('Failed to delete signal');
  }
};

const getAvatarUrl = (avatar) =>
  avatar ? `http://localhost:3000${avatar}` : '/assets/default-avatar.png';

onMounted(fetchSignals);
</script>

<style scoped>
.post-card {
  border-radius: 18px;
  background-color: #f3f4f6;
  color: #1e293b;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

/* Сигнали */
.signal-item {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 12px;
  padding: 10px 14px;
  background-color: transparent;
  transition: none; /* прибираємо будь-які ефекти */
}

/* hover без смужки і зсуву */
.signal-item:hover {
  background-color: rgba(59, 130, 246, 0.1) !important;
  transform: none !important;
}

.signal-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.signal-title {
  font-weight: 600;
  font-size: 14px;
  color: #1e293b;
}

.signal-message {
  font-size: 13px;
  color: #475569;
  margin-top: 2px;
}

/* Delete button */
.delete-btn {
  color: #ef4444;
  transition: color 0.2s;
}

.delete-btn:hover {
  color: #b91c1c;
}

/* Текст при відсутності сигналів */
.no-signal {
  color: #94a3b8;
  font-style: italic;
}
</style>
