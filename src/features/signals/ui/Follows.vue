<template>
  <v-card class="post-card mb-3">
    <v-card-title class="card-title">
      FOLLOWS
    </v-card-title>

    <v-card-text class="card-body">
      <v-list class="follow-list">
        <v-list-item
          v-for="user in users"
          :key="user.id"
          class="follow-item"
          :ripple="false"
          @click="goToProfile(user.id)"
        >
          <template #prepend>
            <v-avatar class="avatar" size="42">
              <v-img :src="getAvatarUrl(user.avatar)" />
            </v-avatar>
          </template>

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

        <div v-if="users.length === 0" class="empty-state">
          No follows yet
        </div>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
  import { useFollows } from '@/features/signals/model/useFollows.js'

  const {
    formatDate,
    getAvatarUrl,
    goToProfile,
    users,
  } = useFollows()
</script>

<style scoped>
.post-card {
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
  padding: 14px;
}

.card-title {
  font-weight: 700;
  font-size: 16px;
  color: #111827;
  letter-spacing: 0.3px;
}

.follow-list {
  padding: 0;
}

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

.avatar {
  border: 2px solid rgba(59, 130, 246, 0.18);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  text-align: center;
  padding: 18px;
  color: #9ca3af;
  font-style: italic;
}

.post-card:hover {
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.10);
}
</style>
