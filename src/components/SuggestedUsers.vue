<template>
  <v-card class="post-card mb-4">
    <v-card-title>Suggested Users</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item
          v-for="user in suggestedUsers"
          :key="user.id"
          @click="goToProfile(user.id)"
          class="user-item"
          :ripple="false"
        >
          <template #prepend>
            <v-avatar size="48" class="cursor-pointer">
              <v-img :src="getAvatarUrl(user.avatar)" />
            </v-avatar>
          </template>

          <div class="user-content">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-desc">{{ user.description || 'No description' }}</div>
          </div>

          <v-list-item-action>
            <v-btn small class="connect-btn" @click.stop="openConnectDialog(user)">
              Connect
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card-text>

    <!-- Connect Dialog -->
    <v-dialog v-model="dialog" max-width="500px" persistent transition="dialog-bottom-transition">
      <v-card class="confirm-card">
        <v-card-title class="confirm-title justify-space-between">
          Send Signal to {{ selectedUser?.name }}
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="confirm-text">
          <v-textarea
            v-model="message"
            label="Message"
            rows="4"
            auto-grow
            outlined
          />
        </v-card-text>
        <v-card-actions class="confirm-actions">
          <v-btn class="confirm-cancel" @click="closeDialog">Cancel</v-btn>
          <v-btn class="confirm-delete" @click="sendSignal">Send</v-btn>
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
  border-radius: 18px;
  background-color: #f3f4f6;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  color: #1e293b;
  padding: 16px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 12px;
  padding: 10px 14px;
  transition: background 0.2s;
  background-color: transparent;
}

.user-item:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.user-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.user-name {
  font-weight: 600;
  font-size: 15px;
}

.user-desc {
  font-size: 14px;
  color: #475569;
}

/* Connect button */
.connect-btn {
  font-weight: 500;
  color: #fff;
  background-color: #6366f1;
  border-radius: 12px;
  padding: 6px 12px;
  transition: background 0.2s;
}

.connect-btn:hover {
  background-color: #4f46e5;
}

/* ===== MODAL ===== */
.confirm-card {
  border-radius: 18px;
  background: #f3f4f6;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  color: #1e293b;
}

.confirm-title {
  font-weight: 700;
  font-size: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.confirm-text {
  margin-top: 8px;
}

.v-textarea {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
}

/* Modal actions */
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
