<template>
  <v-card class="post-card mb-4">
    <v-card-title>Unreplied Signals</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item
          v-for="signal in signals"
          :key="signal.id"
          class="signal-item"
          :ripple="false"
        >
          <!-- Аватарка -->
          <template #prepend>
            <v-avatar
              size="48"
              class="cursor-pointer"
              @click.stop="goToProfile(signal.sender_id)"
            >
              <v-img :src="getAvatarUrl(signal.sender_avatar)" />
            </v-avatar>
          </template>

          <!-- Контент сигналу -->
          <div class="signal-content">
            <div class="post-username">{{ signal.sender_name }}</div>
            <div class="post-meta">{{ signal.message }}</div>
          </div>
          
          <v-list-item-action>
            <v-btn small class="reply-btn" @click.stop="openDialog(signal)">
              Reply
            </v-btn>
          </v-list-item-action>
        </v-list-item>

        <v-list-item v-if="signals.length === 0">
          <v-list-item-title>No new signals</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>

    <!-- Модальне вікно -->
    <v-dialog v-model="dialog" max-width="500px" persistent transition="dialog-bottom-transition">
      <v-card class="confirm-card">
        <v-card-title class="confirm-title justify-space-between">
          Signal from {{ activeSignal?.sender_name }}
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="confirm-text">
          <div class="message-box">{{ activeSignal?.message }}</div>
          <v-textarea v-model="replyMessage" label="Write your reply" rows="3" auto-grow outlined />
        </v-card-text>

        <v-card-actions class="confirm-actions">
          <v-btn class="confirm-cancel" @click="closeDialog">Refuse offer</v-btn>
          <v-btn class="confirm-delete" @click="respond('sing')">Send & Follow</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { api } from '@/api/api.js'
import { useRouter } from 'vue-router'

const props = defineProps({
  updateNotify: Function // функція з Header для оновлення count
})

const signals = ref([])
const dialog = ref(false)
const activeSignal = ref(null)
const replyMessage = ref('')

const router = useRouter()
const getAvatarUrl = (avatar) =>
  avatar ? `http://localhost:3000${avatar}` : '/assets/default-avatar.png'

// --- Fetch signals ---
const fetchSignals = async () => {
  try {
    const res = await api.get('/signals/inbox')
    const newSignals = res.data.signals.filter(s => s.status === 'new')
    signals.value = newSignals
    if (props.updateNotify) props.updateNotify(newSignals.length)
  } catch (err) {
    console.error(err)
  }
}

// --- Auto refresh ---
let intervalId = null
onMounted(() => {
  fetchSignals()
  intervalId = setInterval(fetchSignals, 7000) // кожні 15 сек
})
onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

// --- Dialog functions ---
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

// --- Respond to signal ---
const respond = async (type) => {
  if (!activeSignal.value || !replyMessage.value.trim()) {
    alert('Please enter a reply')
    return
  }

  try {
    await api.post(`/signals/${activeSignal.value.id}/reply`, { message: replyMessage.value })

    if (type === 'sing') {
      await api.post('/follows', {
        targetId: activeSignal.value.sender_id,
        targetType: 'user'
      })
    }

    closeDialog()
    await fetchSignals() // 🔹 після reply оновлюємо signals та notify
  } catch (err) {
    console.error(err)
    alert('Failed to respond')
  }
}

const goToProfile = (userId) => router.push(`/profile/${userId}`)
</script>
<style scoped>
/* ===== POST CARD ===== */
.post-card {
  border-radius: 18px;
  background-color: #f5f7fa;
  color: #1e293b;
  margin-bottom: 16px;
  padding: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
}

/* ===== SIGNAL ITEM ===== */
.signal-item {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 12px;
  padding: 10px 14px;
  transition: background 0.2s;
  background-color: transparent !important;
}

.signal-item:hover {
  background: rgba(59, 130, 246, 0.1) !important;
  transform: none !important;
}

.signal-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.post-username {
  font-weight: 600;
  font-size: 15px;
  color: #1e293b;
}

.post-meta {
  font-size: 14px;
  color: #475569;
}

/* ===== REPLY BUTTON ===== */
.reply-btn {
  font-weight: 500;
  color: #fff;
  background-color: #6366f1;
  border-radius: 12px;
  padding: 6px 12px;
  transition: background 0.2s;
}

.reply-btn:hover {
  background-color: #4f46e5;
}

/* ===== MODAL ===== */
.confirm-card {
  border-radius: 18px;
  background: #f3f4f6;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  color: #1e293b;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.confirm-title {
  font-weight: 700;
  font-size: 18px;
  color: #1e293b;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-box {
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 12px;
  background-color: #e0e7ff;
  font-size: 14px;
  white-space: pre-wrap;
  color: #1e293b;
  border: 1px solid #c7d2fe;
}

.v-textarea {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
}

/* ===== MODAL ACTIONS ===== */
.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 16px 16px;
}

.confirm-cancel {
  background: #f87171;
  color: #fff;
  font-weight: 600;
  border-radius: 12px;
  padding: 8px 16px;
}

.confirm-cancel:hover {
  background: #ef4444;
}

.confirm-delete {
  background: #22c55e;
  color: #fff;
  font-weight: 600;
  border-radius: 12px;
  padding: 8px 16px;
}

.confirm-delete:hover {
  background: #16a34a;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
