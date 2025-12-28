<template>
  <v-card class="post-card mb-4">
    <v-card-title>Suggested Users</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item
          v-for="user in suggestedUsers"
          :key="user.id"
        >
          <template #prepend>
            <v-avatar size="48">
              <v-img :src="getAvatarUrl(user.avatar)" />
            </v-avatar>
          </template>
          <v-list-item>
            <v-list-item-title>{{ user.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ user.description || 'No description' }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item-action>
            <v-btn small @click="openConnectDialog(user)">Connect</v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card-text>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>Send Signal to {{ selectedUser?.name }}</v-card-title>
        <v-card-text>
          <v-textarea v-model="message" label="Message" rows="4" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" @click="sendSignal">Send</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '@/api/api.js';
import { useAuthStore } from '@/stores/auth.js';

const auth = useAuthStore();
const suggestedUsers = ref([]);
const dialog = ref(false);
const selectedUser = ref(null);
const message = ref('');

const getAvatarUrl = (a) => a ? `http://localhost:3000${a}` : '/assets/default-avatar.png';

const fetchSuggestedUsers = async () => {
  try {
    const res = await api.get('/users'); // отримуємо всіх користувачів
    // виключаємо поточного користувача
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

onMounted(fetchSuggestedUsers);
</script>
