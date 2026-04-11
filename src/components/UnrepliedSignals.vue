<template>
  <v-card class="post-card mb-4">
    <v-card-title class="card-title">
      Unreplied Signals
    </v-card-title>

    <v-card-text class="card-body">
      <v-list class="signal-list">

        <v-list-item v-for="signal in signals" :key="signal.id" class="signal-item" :ripple="false">
          <!-- AVATAR -->
          <template #prepend>
            <v-avatar size="46" class="avatar" @click.stop="goToProfile(signal.sender_id)">
              <v-img :src="getAvatarUrl(signal.sender_avatar)" />
            </v-avatar>
          </template>

          <!-- CONTENT -->
          <div class="signal-content">
            <div class="signal-name">
              {{ signal.sender_name }}
            </div>

            <div class="signal-message">
              {{ signal.message }}
            </div>
          </div>

          <!-- RIGHT ACTION (ALIGNED) -->
          <template #append>
            <v-btn class="reply-btn" @click.stop="openDialog(signal)">
              Reply
            </v-btn>
          </template>
        </v-list-item>

        <!-- EMPTY STATE -->
        <div v-if="signals.length === 0" class="empty-state">
          No new signals
        </div>

      </v-list>
    </v-card-text>

    <!-- DIALOG -->
    <v-dialog v-model="dialog" max-width="520px" persistent transition="dialog-bottom-transition">
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

          <v-textarea v-model="replyMessage" label="Write your reply" rows="3" auto-grow variant="outlined"
            class="reply-input" />
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
  console.log('FETCH CALLED 🔥')

  try {
    const res = await api.get('/signals/conversations/inbox')
    const newSignals = res.data.signals
    signals.value = newSignals
    if (props.updateNotify) props.updateNotify(newSignals.length)
  } catch (err) {
    console.error(err)
  }
}

// --- Auto refresh ---
let intervalId = null
onMounted(() => {
  console.log('🔥 MOUNTED')
  fetchSignals()
  console.log('🔥 MOUNTED')
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
/* ===== CARD ===== */
.post-card {
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
  padding: 14px;
}

.card-title {
  font-weight: 700;
  font-size: 18px;
  color: #111827;
}

/* ===== LIST ===== */
.signal-list {
  padding: 0;
}

/* ===== ITEM ===== */
.signal-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 10px;
  border-radius: 14px;
  transition: all 0.2s ease;
}

.signal-item:hover {
  background: rgba(99, 102, 241, 0.06);
}

/* ===== AVATAR ===== */
.avatar {
  border: 2px solid rgba(99, 102, 241, 0.25);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
  cursor: pointer;
}

/* ===== TEXT ===== */
.signal-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.signal-name {
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

/* ===== BUTTON RIGHT ===== */
.reply-btn {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: #000000;
  font-weight: 600;
  border-radius: 10px;
  padding: 6px 14px;
  background: linear-gradient(90deg, #d3ffad 11%, #97e5ee 100%);
  text-transform: none;
}

.reply-btn:hover {
  transform: translateY(-1px);
  background: linear-gradient(90deg, #d3ffad 11%, #97e5ee 100%);
}

/* ===== EMPTY ===== */
.empty-state {
  text-align: center;
  color: #9ca3af;
  padding: 20px;
  font-style: italic;
}

/* ===== MODAL ===== */
.modal-card {
  border-radius: 18px;
  background: #ffffff;
  padding: 10px;
}

.modal-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  color: #111827;
}

.close-btn {
  color: #6b7280;
}

.modal-body {
  padding-top: 10px;
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

.reply-input {
  background: #fff;
}

/* ===== MODAL BUTTONS ===== */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 14px 14px;
}

.btn-refuse {
  background: #f87171;
  color: white;
  font-weight: 600;
  border-radius: 10px;
}

.btn-refuse:hover {
  background: #ef4444;
}

.btn-send {
  background: #22c55e;
  color: white;
  font-weight: 600;
  border-radius: 10px;
}

.btn-send:hover {
  background: #16a34a;
}
</style>
