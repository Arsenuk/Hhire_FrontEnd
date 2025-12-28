<template>
  <v-card class="post-card mb-4">
    <v-card-title>Sent Signals</v-card-title>

    <v-card-text>
      <v-list>
        <v-list-item
          v-for="signal in signals"
          :key="signal.id"
          class="signal-item"
        >
          <div class="signal-content">
            <div class="signal-title">
              To: {{ signal.receiver_name }}
            </div>
            <div class="signal-message">
              {{ signal.message }}
            </div>
          </div>

          <v-btn
            icon
            color="error"
            variant="text"
            @click="deleteSignal(signal)"
          >
            ✕
          </v-btn>
        </v-list-item>

        <v-list-item v-if="signals.length === 0">
          <v-list-item-title class="text-grey">
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
    const res = await api.get('/signals/sent')

    // тільки актуальні (без відповіді і не видалені)
    signals.value = res.data.signals.filter(
      s => s.status !== 'answered' && s.status !== 'deleted'
    )
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

onMounted(fetchSignals)
</script>

<style scoped>
.signal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px;
  padding: 10px;
}

.signal-content {
  max-width: 85%;
}

.signal-title {
  font-weight: 600;
  font-size: 14px;
}

.signal-message {
  font-size: 13px;
  color: #555;
}
</style>
