<template>
  <v-container fluid class="profile-page">
    <template v-if="user">
      <!-- Верхній блок: аватар + ім'я + кнопка Logout -->
      <v-row class="mb-6" align="center" justify="space-between">
        <v-col cols="12" md="2" class="text-center">
          <v-avatar size="120">
            <v-img :src="getAvatarUrl(user.avatar)" />
          </v-avatar>

        </v-col>
        <v-col cols="12" md="8">
          <h1>{{ user.name || "User didn't provide information" }}</h1>
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
              {{ user.description || "User didn't provide information" }}
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
                    <a :href="link.url" target="_blank" rel="noopener noreferrer">
                      {{ link.description || link.url }}
                    </a>
                  </v-list-item-title>
                </v-list-item>
                <v-list-item v-if="links.length === 0">
                  <v-list-item-title>User didn't provide information</v-list-item-title>
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
                  <v-list-item-title>User didn't provide information</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Loader -->
    <v-row v-else justify="center" align="center" class="fill-height">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="50"></v-progress-circular>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { api } from '@/api/api.js'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)
const links = ref([])
const posts = ref([])
const defaultAvatar = '/default-avatar.png'

const getAvatarUrl = (avatar) => {
  if (!avatar) return defaultAvatar;
  return `http://localhost:3000/${avatar}`;
};


async function loadProfile() {
  try {
    const [profileRes, linksRes, postsRes] = await Promise.all([
      api.get('/users/profile'),
      api.get('/user-links'),
      api.get('/posts') // 
    ])

    authStore.user = profileRes.data
    links.value = linksRes.data
    posts.value = postsRes.data.posts
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.error || err.message || 'Failed to load profile')
  }
}

async function logout() {
  try {
    await api.post('/auth/logout')  // ✅
  } catch (err) {
    console.warn('Logout request failed, clearing local state anyway')
  } finally {
    authStore.user = null
    authStore.accessToken = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    router.push('/')
  }
}

onMounted(() => {
  authStore.loadUserFromStorage()
  loadProfile()
})
</script>

<style scoped>
.profile-page {
  margin-top: 60px;
}

h1 {
  font-weight: 700;
}
</style>
