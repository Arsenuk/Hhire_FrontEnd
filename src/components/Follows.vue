<template>
  <v-card class="post-card mb-3">
    <v-card-title class="card-title">
      FOLLOWS
    </v-card-title>

    <v-card-text class="card-body">
      <v-list class="follow-list">

        <v-list-item v-for="user in users" :key="user.id" class="follow-item" @click="goToProfile(user.id)"
          :ripple="false">

          <!-- AVATAR -->
          <template #prepend>
            <v-avatar size="42" class="avatar">
              <v-img :src="getAvatarUrl(user.avatar)" />
            </v-avatar>
          </template>

          <!-- CONTENT -->
          <div class="follow-content">
            <div class="follow-name">
              {{ user.name }}
            </div>

            <div class="follow-meta">
              Last post:
              <span v-if="user.lastPost">
                {{ formatDate(user.lastPost) }}
              </span>
              <span v-else>No posts</span>
            </div>
          </div>

        </v-list-item>

        <!-- EMPTY STATE -->
        <div v-if="users.length === 0" class="empty-state">
          No follows yet
        </div>

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
  background: #ffffff;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
  padding: 14px;
}

/* TITLE */
.card-title {
  font-weight: 700;
  font-size: 16px;
  color: #111827;
  letter-spacing: 0.3px;
}

/* LIST RESET */
.follow-list {
  padding: 0;
}

/* ITEM */
.follow-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 10px;
  border-radius: 14px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.follow-item:hover {
  background: rgba(59, 130, 246, 0.06);
  transform: translateY(-1px);
}

/* AVATAR */
.avatar {
  border: 2px solid rgba(59, 130, 246, 0.18);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

/* CONTENT */
.follow-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.follow-name {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
}

.follow-meta {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;

  /* якщо довго — не ламає UI */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* EMPTY STATE */
.empty-state {
  text-align: center;
  padding: 18px;
  color: #9ca3af;
  font-style: italic;
}

/* smooth consistency with other cards */
.post-card:hover {
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.10);
}
</style>
