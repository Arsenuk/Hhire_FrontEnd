<template>
  <v-card class="post-card mb-4">
    <v-card-title class="title">Suggested Users</v-card-title>

    <v-card-text class="card-body">
      <v-list class="list">
        <v-list-item v-for="user in suggestedUsers" :key="user.id" class="user-item" :ripple="false">
          <!-- LEFT SIDE -->
          <div class="left" @click="goToProfile(user.id)">
            <v-avatar size="48" class="avatar">
              <v-img :src="getAvatarUrl(user.avatar)" />
            </v-avatar>

            <div class="user-content">
              <div class="user-name">{{ user.name }}</div>
              <div class="user-desc">
                {{ user.description || 'No description' }}
              </div>
            </div>
          </div>

          <!-- RIGHT SIDE ACTION -->
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
          <v-textarea v-model="message" label="Write your message" rows="4" auto-grow variant="outlined" />
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
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '@/api/api.js';
import { useAuthStore } from '@/stores/auth.js';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const suggestedUsers = ref([]);
const dialog = ref(false);
const selectedUser = ref(null);
const message = ref('');

const getAvatarUrl = (a) => a ? `http://localhost:3000${a}` : '/assets/default-avatar.png';

const fetchSuggestedUsers = async () => {
  try {
    const res = await api.get('/users');
    suggestedUsers.value = res.data.filter(u => u.id !== auth.user.id);
  } catch (err) {
    console.error(err);
  }
};

const openConnectDialog = (user) => {
  selectedUser.value = user;
  message.value = '';
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
};

const sendSignal = async () => {
  if (!message.value.trim()) return alert('Enter a message');
  try {
    await api.post('/signals', {
      sender_type: 'user',
      sender_id: auth.user.id,
      receiver_type: 'user',
      receiver_id: selectedUser.value.id,
      message: message.value
    });
    dialog.value = false;
    alert('Signal sent!');
  } catch (err) {
    console.error(err);
    alert('Failed to send signal');
  }
};

const goToProfile = (userId) => router.push(`/profile/${userId}`);

onMounted(fetchSuggestedUsers);
</script>

<style scoped>
.post-card {
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  padding: 16px;
}

.title {
  font-weight: 700;
  font-size: 16px;
  color: #111827;
}

/* LIST */
.list {
  padding: 0;
}

/* ITEM ROW */
.user-item {
  display: flex;
  align-items: stretch;
  /* 🔥 ключ */
  justify-content: space-between;

  padding: 0;
  border-radius: 14px;

  transition: all 0.2s ease;
  background: transparent;
}

.user-item:hover {
  background: rgba(99, 102, 241, 0.06);
}

/* LEFT SIDE */
.left {
  display: flex;
  align-items: center;
  gap: 12px;

  flex: 1;
  padding: 12px 14px;

  cursor: pointer;
}

.avatar {
  border: 2px solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.user-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
}

.user-desc {
  font-size: 13px;
  color: #6b7280;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
}

/* RIGHT SIDE FULL HEIGHT ACTION */
.right {
  display: flex;
  align-items: stretch;
}

/* CONNECT BUTTON = FULL HEIGHT COLUMN */
.connect-btn {
  height: 30px;
  border-radius: 14px !important;

  background: linear-gradient(90deg, #d3ffad 11%, #97e5ee 100%);
  color: #000000;

  font-weight: 600;
  font-size: 13px;
  text-transform: none;

  padding: 0 18px;

  /* min-width: 120px; */

  box-shadow: none;
  transition: all 0.2s ease;
}

.connect-btn:hover {
  background: linear-gradient(90deg, #62ab23 33%, #4b9ce2 100%);
  transform: translateY(-1px);
}

.connect-btn:active {
  transform: scale(0.98);
}

/* DIALOG */
.confirm-card {
  border-radius: 18px;
  background: #f9fafb;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}

.confirm-title {
  font-weight: 700;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.to-user {
  font-weight: 500;
  color: #6366f1;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 16px 16px;
}

.cancel-btn {
  background: #e5e7eb;
  color: #111827;
  border-radius: 12px;
  font-weight: 600;
}

.send-btn {
  background: #22c55e;
  color: #fff;
  border-radius: 12px;
  font-weight: 600;
}

.send-btn:hover {
  background: #16a34a;
}
</style>