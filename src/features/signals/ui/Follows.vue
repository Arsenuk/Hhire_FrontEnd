<template>
  <v-card class="post-card mb-3">
    <v-card-title class="card-title">
      FOLLOWS
    </v-card-title>

    <v-card-text class="card-body">
      <v-list class="follow-list">
        <v-list-item
          v-for="(user, index) in filteredUsers"
          :key="user.id ?? `follow-${index}`"
          class="follow-item"
          :ripple="false"
          @click="goToProfile(user.id)"
        >
          <UserPreview
            clickable
            :subtitle="getLastPostSubtitle(user)"
            :user="user"
          />
        </v-list-item>

        <div v-if="filteredUsers.length === 0" class="empty-state">
          {{ emptyStateText }}
        </div>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import UserPreview from '@/entities/user/ui/UserPreview.vue'
  import { useFollows } from '@/features/signals/model/useFollows'
  import type { User } from '@/shared/types'

  const props = defineProps<{
    searchQuery?: string
  }>()

  const {
    formatDate,
    goToProfile,
    users,
  } = useFollows()

  const filteredUsers = computed(() => {
    const query = props.searchQuery?.trim().toLowerCase()

    if (!query) {
      return users.value
    }

    return users.value.filter(user => {
      const haystack = [
        user.name,
        user.email,
        user.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  })

  const emptyStateText = computed(() => (
    props.searchQuery?.trim()
      ? 'No follows match this search'
      : 'No follows yet'
  ))

  function getLastPostSubtitle(user: User) {
    const lastPostDate = typeof user.lastPost === 'string' || typeof user.lastPost === 'number' || user.lastPost instanceof Date
      ? user.lastPost
      : null

    return lastPostDate ? `Last post: ${formatDate(lastPostDate)}` : 'Last post: No posts'
  }
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

:deep(.entity-user-preview__avatar) {
  border: 2px solid rgba(59, 130, 246, 0.18);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
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
