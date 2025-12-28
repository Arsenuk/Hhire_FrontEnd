<template>
  <v-card class="post-card mb-4">
    <v-card-title>Unreplied Signals</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item
          v-for="signal in signals"
          :key="signal.id"
          @click="openDialog(signal)"
          class="signal-item"
        >
          <v-list-item>
            <v-list-item-title>From: {{ signal.sender_name }}</v-list-item-title>
            <v-list-item-subtitle>{{ signal.message }}</v-list-item-subtitle>
          </v-list-item>
        </v-list-item>

        <v-list-item v-if="signals.length === 0">
          <v-list-item-title>No new signals</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="justify-space-between">
          <span>Signal from {{ activeSignal?.sender_name }}</span>
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <div class="message-box">
            {{ activeSignal?.message }}
          </div>
          <v-textarea
            v-model="replyMessage"
            label="Write your reply"
            rows="3"
            auto-grow
            outlined
          />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn color="grey" @click="respond('decline')">Decline</v-btn>
          <v-btn color="primary" @click="respond('sing')">Sing & Follow</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api/api.js'

const signals = ref([])
const dialog = ref(false)
const activeSignal = ref(null)
const replyMessage = ref('')

const fetchSignals = async () => {
  try {
    const res = await api.get('/signals/inbox')
    signals.value = res.data.signals.filter(s => s.status === 'new')
  } catch (err) {
    console.error(err)
  }
}

const openDialog = (signal) => {
  activeSignal.value = signal
  replyMessage.value = ''
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  activeSignal.value = null
  replyMessage.value = ''
}

const respond = async (type) => {
  if (!activeSignal.value || !replyMessage.value.trim()) {
    alert('Please enter a reply')
    return
  }

  try {
    // Відправляємо відповідь
    await api.post(`/signals/${activeSignal.value.id}/reply`, { message: replyMessage.value })

    // Якщо type === sing → робимо follow
    if (type === 'sing') {
      await api.post('/follows', {
        targetId: activeSignal.value.sender_id,
        targetType: 'user'
      })
    }

    alert('Response sent!')
    closeDialog()
    fetchSignals()
  } catch (err) {
    console.error(err)
    alert('Failed to respond')
  }
}

onMounted(fetchSignals)
</script>

<style scoped>
.signal-item {
  cursor: pointer;
  transition: background 0.2s;
  border-radius: 12px;
  padding: 8px 12px;
}

.signal-item:hover {
  background: rgba(151, 229, 238, 0.2);
}

.post-card {
  border-radius: 18px;
  padding-bottom: 4px;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.message-box {
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 12px;
  background-color: #f0f4f8;
  font-size: 14px;
  white-space: pre-wrap;
}
</style>
