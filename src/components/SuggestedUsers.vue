<template>
  <v-card class="post-card mb-4">
    <v-card-title class="title">Suggested Users</v-card-title>

    <v-card-text class="card-body">
      <v-list class="list">
        <v-list-item v-for="user in suggestedUsers" :key="user.id" class="user-item" :ripple="false">
          <!-- LEFT -->
          <div class="left" @click="goToProfile(user.id)">
            <v-avatar class="avatar" size="48">
              <v-img :src="getAvatarUrl(user.avatar)" />
            </v-avatar>

            <div class="user-content">
              <div class="user-name">{{ user.name }}</div>
              <div class="user-desc">
                {{ user.description || 'No description' }}
              </div>
            </div>
          </div>

          <!-- RIGHT -->
          <div class="right">
            <v-btn class="connect-btn" variant="flat" @click.stop="openConnectDialog(user)">
              Connect
            </v-btn>
          </div>
        </v-list-item>
      </v-list>
    </v-card-text>

    <!-- DIALOG -->
    <v-dialog v-model="dialog" max-width="520px" persistent>
      <v-card class="confirm-card">
        <v-card-title class="confirm-title">
          Send Signal
          <span class="to-user">to {{ selectedUser?.name }}</span>

          <v-btn icon variant="text" @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-textarea
            v-model="message"
            auto-grow
            label="Write your message"
            rows="4"
            variant="outlined"
          />
        </v-card-text>

        <v-card-actions class="confirm-actions">
          <v-btn class="cancel-btn" @click="closeDialog">
            Cancel
          </v-btn>

          <v-btn class="send-btn" @click="sendSignal">
            Send
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 🔥 SNACKBAR NOTIFICATIONS -->
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
  import { onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { api } from '@/api/api.js'
  import { useAuthStore } from '@/features/auth/model/auth.store.js'

  const auth = useAuthStore()
  const router = useRouter()

  const suggestedUsers = ref([])
  const dialog = ref(false)
  const selectedUser = ref(null)
  const message = ref('')

  // 🔥 SNACKBAR STATE
  const snackbar = ref({
    show: false,
    text: '',
    color: 'success',
  })

  function showToast (text, color = 'success') {
    snackbar.value.text = text
    snackbar.value.color = color
    snackbar.value.show = true
  }

  function getAvatarUrl (a) {
    return a ? `http://localhost:3000${a}` : '/assets/default-avatar.png'
  }

  // FETCH
  async function fetchSuggestedUsers () {
    try {
      const res = await api.get('/users')
      suggestedUsers.value = res.data.filter(u => u.id !== auth.user.id)
    } catch (error) {
      console.error(error)
      showToast('Failed to load users', 'error')
    }
  }

  // DIALOG
  function openConnectDialog (user) {
    selectedUser.value = user
    message.value = ''
    dialog.value = true
  }

  function closeDialog () {
    dialog.value = false
  }

  // SEND SIGNAL
  async function sendSignal () {
    if (!message.value.trim()) {
      showToast('Please enter a message', 'warning')
      return
    }

    try {
      await api.post('/signals', {
        sender_type: 'user',
        sender_id: auth.user.id,
        receiver_type: 'user',
        receiver_id: selectedUser.value.id,
        message: message.value,
      })

      dialog.value = false
      showToast('Signal sent successfully 🚀', 'success')
    } catch (error) {
      console.error(error)
      showToast('Failed to send signal', 'error')
    }
  }

  const goToProfile = userId => router.push(`/profile/${userId}`)

  onMounted(fetchSuggestedUsers)
</script>

<style scoped>
/* ===== CARD ===== */
.post-card {
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.06);
  padding: 16px;
  transition: all 0.2s ease;
}

.post-card:hover {
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.08);
}

/* TITLE */
.title {
  font-weight: 700;
  font-size: 16px;
  color: #111827;
  letter-spacing: 0.3px;
}

/* LIST */
.list {
  padding: 0;
}

/* ===== USER ITEM ===== */
.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 0;
  border-radius: 16px;
  margin-bottom: 10px;

  background: transparent;
  transition: all 0.25s ease;
}

.user-item:hover {
  background: rgba(99, 102, 241, 0.06);
  transform: translateY(-1px);
}

/* LEFT SIDE */
.left {
  display: flex;
  align-items: center;
  gap: 14px;

  flex: 1;
  padding: 12px 14px;

  cursor: pointer;
  min-width: 0;
}

/* AVATAR */
.avatar {
  border-radius: 14px;
  border: 2px solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease;
}

.user-item:hover .avatar {
  transform: scale(1.03);
}

/* TEXT */
.user-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-weight: 700;
  font-size: 14px;
  color: #111827;
  letter-spacing: 0.2px;
}

.user-desc {
  font-size: 13px;
  color: #6b7280;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
  margin-top: 2px;
}

/* RIGHT SIDE */
.right {
  display: flex;
  align-items: center;
  padding-right: 14px;
}

/* CONNECT BUTTON */
.connect-btn {
  height: 36px;
  padding: 0 18px;

  border-radius: 14px !important;

  background: linear-gradient(135deg, #6366f1, #22c55e);
  color: #ffffff;

  font-weight: 600;
  font-size: 13px;
  text-transform: none;

  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.25);
  transition: all 0.25s ease;
}

.connect-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(99, 102, 241, 0.35);
}

.connect-btn:active {
  transform: scale(0.97);
}

/* ===== DIALOG ===== */
.confirm-card {
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.18);
  padding: 8px;
}

.confirm-title {
  font-weight: 700;
  font-size: 16px;
  color: #111827;

  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
}

.to-user {
  font-weight: 500;
  color: #6366f1;
  margin-left: 6px;
}

/* TEXTAREA */
:deep(.v-textarea) {
  border-radius: 14px;
}

/* ACTIONS */
.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 14px 14px;
}

/* CANCEL */
.cancel-btn {
  background: #f3f4f6;
  color: #111827;

  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

/* SEND */
.send-btn {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;

  border-radius: 12px;
  font-weight: 600;
  text-transform: none;

  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.25);
}

.send-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(34, 197, 94, 0.35);
}

/* SNACKBAR (optional polish) */
:deep(.v-snackbar) {
  border-radius: 12px;
  font-weight: 500;
}
</style>
