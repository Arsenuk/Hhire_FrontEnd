<template>
  <v-card class="post-card mb-3">
    <v-card-title>FOLLOWS</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item
          v-for="user in users"
          :key="user.id"
          class="follow-item"
          @click="goToProfile(user.id)"
          :ripple="false"
        >
          <!-- Аватарка -->
          <template #prepend>
            <v-avatar size="40">
              <v-img :src="getAvatarUrl(user.avatar)" />
            </v-avatar>
          </template>

          <!-- Контент користувача -->
          <div class="follow-content">
            <div class="follow-name">{{ user.name }}</div>
            <div class="follow-meta">
              Last post: {{ user.lastPost ? formatDate(user.lastPost) : 'No posts' }}
            </div>
          </div>
        </v-list-item>

        <v-list-item v-if="users.length === 0">
          <v-list-item-title class="no-follow">No follows yet</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api/api.js'

const router = useRouter()
const users = ref([])

const getAvatarUrl = (a) =>
  a ? `http://localhost:3000${a}` : '/assets/default-avatar.png'

onMounted(async () => {
  try {
    const res = await api.get('/follows/following')
    users.value = res.data
  } catch (err) {
    console.error('Failed to load following users', err)
  }
})

function goToProfile(id) {
  router.push(`/profile/${id}`)
}

function formatDate(d) {
  return new Date(d).toLocaleDateString()
}
</script>


<style scoped>
.post-card {
  border-radius: 18px;
  background-color: #f3f4f6;
  color: #1e293b;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.post-card .v-card-title {
  font-weight: 700;
  font-size: 16px;
  color: #1e293b;
}

/* Користувачі */
.follow-item {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 12px;
  padding: 10px 14px;
  background-color: transparent;
  transition: transform 0.15s;
}

/* Забираємо будь-яку підсвітку Vuetify */
.follow-item:hover {
  background-color:  rgba(59, 130, 246, 0.1) !important ;
  transform: none;
}

.follow-content {
  display: flex;
  flex-direction: column;
}
.follow-content {
  display: flex;
  flex-direction: column;
}

.follow-name {
  font-weight: 600;
  font-size: 14px;
  color: #1e293b;
}

.follow-meta {
  font-size: 13px;
  color: #475569;
  margin-top: 2px;
}

/* Текст при відсутності підписок */
.no-follow {
  color: #94a3b8;
  font-style: italic;
}
</style>

