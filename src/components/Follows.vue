<template>
  <v-card class="post-card mb-3">
    <v-card-title>FOLLOWS</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item
          v-for="user in users"
          :key="user.id"
          @click="goToProfile(user.id)"
        >
          <template #prepend>
            <v-avatar size="40">
              <v-img :src="getAvatarUrl(user.avatar)" />
            </v-avatar>
          </template>

          <v-list-item-title>{{ user.name }}</v-list-item-title>
          <v-list-item-subtitle>
            Last post: {{ user.lastPost ? formatDate(user.lastPost) : 'No posts' }}
          </v-list-item-subtitle>
        </v-list-item>

        <v-list-item v-if="users.length === 0">
          <v-list-item-title>No follows yet</v-list-item-title>
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
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.post-card .v-card-title {
  font-weight: 600;
  font-size: 16px;
}

.v-list-item {
  cursor: pointer;
  transition: background 0.2s;
  border-radius: 12px;
}

.v-list-item:hover {
  background: rgba(151, 229, 238, 0.2);
}
</style>
