<template>
  <v-container fluid>
    <!-- Верхній блок: аватар + ім'я + кнопка Logout -->
    <v-row class="mb-6" align="center" justify="space-between">
      <v-col cols="12" md="2" class="text-center">
        <v-avatar size="120">
          <v-img :src="user.avatar || defaultAvatar" />
        </v-avatar>
      </v-col>
      <v-col cols="12" md="8">
        <h1>{{ user.name || "User don't give information" }}</h1>
      </v-col>
      <v-col cols="12" md="2" class="text-right">
        <v-btn color="error" @click="logout">Logout</v-btn>
      </v-col>
    </v-row>

    <!-- Середній блок: Description та Useful Links -->
    <v-row class="mb-6">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Description</v-card-title>
          <v-card-text>
            {{ user.description || "User don't give information" }}
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Useful Links</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="link in links" :key="link.id">
                <v-list-item-title>
                  <a :href="link.url" target="_blank">{{ link.description || link.url }}</a>
                </v-list-item-title>
              </v-list-item>
              <v-list-item v-if="links.length === 0">
                <v-list-item-title>User don't give information</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Нижній блок: Posts -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Posts</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="post in posts" :key="post.id">
                <v-list-item-title>{{ post.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ post.content }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="posts.length === 0">
                <v-list-item-title>User don't give information</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const user = ref({});
const links = ref([]);
const posts = ref([]);
const defaultAvatar = '/default-avatar.png';
const router = useRouter();

async function loadProfile() {
  try {
    const token = localStorage.getItem('accessToken');
    const { data: profile } = await axios.get(
      'http://localhost:3000/api/users/profile',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    user.value = profile;

    const { data: userLinks } = await axios.get(
      'http://localhost:3000/api/user-links',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    links.value = userLinks;

    const { data: userPosts } = await axios.get(
      `http://localhost:3000/api/posts/${profile.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    posts.value = userPosts;
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || 'Failed to load profile');
  }
}

function logout() {
  localStorage.removeItem('accessToken');
  router.push('/login');
}

onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
h1 {
  font-weight: 700;
}
</style>
