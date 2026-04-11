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

          <!-- ACTION -->
          <template #append>
            <v-btn class="reply-btn" @click.stop="openDialog(signal)">
              Reply
            </v-btn>
          </template>

        </v-list-item>

        <!-- EMPTY -->
        <div v-if="signals.length === 0" class="empty-state">
          No new signals
        </div>

      </v-list>
    </v-card-text>

    <!-- DIALOG -->
    <v-dialog v-model="dialog" max-width="520px" persistent>
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

          <v-textarea v-model="replyMessage" label="Write your reply" rows="3" auto-grow variant="outlined" />

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

    <!-- 🔥 SNACKBAR -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500" location="bottom" multi-line
      rounded="pill">
      {{ snackbar.text }}
    </v-snackbar>

  </v-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { api } from '@/api/api.js'
import { useRouter } from 'vue-router'

const props = defineProps({
  updateNotify: Function
})

const router = useRouter()

const signals = ref([])
const dialog = ref(false)
const activeSignal = ref(null)
const replyMessage = ref('')

/* ===== SNACKBAR ===== */
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const showToast = (text, color = 'success') => {
  snackbar.value.text = text
  snackbar.value.color = color
  snackbar.value.show = true
}

/* ===== AVATAR ===== */
const getAvatarUrl = (avatar) =>
  avatar ? `http://localhost:3000${avatar}` : '/assets/default-avatar.png'

/* ===== FETCH ===== */
const fetchSignals = async () => {
  try {
    const res = await api.get('/signals/conversations/inbox')
    signals.value = res.data.signals

    if (props.updateNotify) {
      props.updateNotify(signals.value.length)
    }

  } catch (err) {
    console.error(err)
    showToast('Failed to load signals', 'error')
  }
}

/* ===== LIFECYCLE ===== */
let intervalId = null

onMounted(() => {
  fetchSignals()
  intervalId = setInterval(fetchSignals, 7000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

/* ===== UI ACTIONS ===== */
const openDialog = (signal) => {
  activeSignal.value = signal
  replyMessage.value = ''
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  activeSignal.value = null
}

/* ===== RESPOND ===== */
const respond = async (type) => {
  if (!replyMessage.value.trim()) {
    showToast('Please enter a reply message', 'warning')
    return
  }

  try {
    await api.post(`/signals/${activeSignal.value.id}/reply`, {
      message: replyMessage.value
    })

    if (type === 'sing') {
      await api.post('/follows', {
        targetId: activeSignal.value.sender_id,
        targetType: 'user'
      })
    }

    closeDialog()
    await fetchSignals()

    showToast('Reply sent successfully 🚀', 'success')

  } catch (err) {
    console.error(err)
    showToast('Failed to send reply', 'error')
  }
}

/* ===== NAV ===== */
const goToProfile = (id) => {
  router.push(`/profile/${id}`)
}
</script>

<style scoped>
/* ===== CARD ===== */
.post-card {
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  padding: 14px;
  transition: all 0.2s ease;
}

.post-card:hover {
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.08);
}

/* TITLE */
.card-title {
  font-weight: 800;
  font-size: 18px;
  color: #111827;
  letter-spacing: 0.3px;
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

  transition: all 0.25s ease;
  position: relative;
}

.signal-item:hover {
  background: rgba(99, 102, 241, 0.06);
  transform: translateY(-1px);
}

/* ===== AVATAR ===== */
.avatar {
  border-radius: 14px;
  border: 2px solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.signal-item:hover .avatar {
  transform: scale(1.03);
}

/* ===== TEXT ===== */
.signal-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.signal-name {
  font-weight: 700;
  font-size: 14px;
  color: #111827;
  margin-bottom: 2px;
}

.signal-message {
  font-size: 13px;
  color: #6b7280;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* ===== REPLY BUTTON (RIGHT SIDE) ===== */
.reply-btn {
  height: 34px;
  padding: 0 14px;

  border-radius: 12px !important;

  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: #ffffff;

  font-weight: 600;
  font-size: 12px;
  text-transform: none;

  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.25);

  transition: all 0.25s ease;
}

.reply-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(99, 102, 241, 0.35);
}

.reply-btn:active {
  transform: scale(0.96);
}

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  color: #9ca3af;
  padding: 20px;
  font-style: italic;
  font-size: 13px;
}

/* ===== MODAL ===== */
.modal-card {
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.18);
  padding: 8px;
}

/* HEADER */
.modal-title {
  display: flex;
  justify-content: space-between;
  align-items: center;

  font-weight: 800;
  font-size: 16px;
  color: #111827;

  padding: 10px 14px;
}

/* CLOSE BUTTON */
.close-btn {
  color: #6b7280;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #111827;
  transform: rotate(90deg);
}

/* MESSAGE BOX */
.message-box {
  background: #eef2ff;
  border: 1px solid #c7d2fe;

  padding: 12px;
  border-radius: 12px;

  margin-bottom: 12px;

  font-size: 13px;
  color: #111827;
}

/* TEXTAREA */
:deep(.v-textarea) {
  border-radius: 14px;
}

/* ACTIONS */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  padding: 12px 14px 14px;
}

/* BUTTONS */
.btn-refuse {
  background: #f3f4f6;
  color: #111827;

  font-weight: 600;
  border-radius: 12px;
  text-transform: none;
}

.btn-refuse:hover {
  background: #e5e7eb;
}

.btn-send {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #ffffff;

  font-weight: 600;
  border-radius: 12px;
  text-transform: none;

  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.25);
}

.btn-send:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(34, 197, 94, 0.35);
}
</style>