<template>
  <div
    :class="['entity-user-preview', { 'entity-user-preview--clickable': clickable }]"
    @click="handleClick"
  >
    <UserAvatar class="entity-user-preview__avatar" :size="avatarSize" :user="props.user" />

    <div class="entity-user-preview__content">
      <div class="entity-user-preview__name">
        {{ displayName }}
      </div>

      <div v-if="ratingText" class="entity-user-preview__rating">
        {{ ratingText }}
      </div>

      <div v-if="subtitle" class="entity-user-preview__subtitle">
        {{ subtitle }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { getUserDisplayName } from '@/entities/user/lib/getUserDisplayName'
  import UserAvatar from '@/entities/user/ui/UserAvatar.vue'
  import type { Nullable, User } from '@/shared/types'

  type RatingSummary = {
    value: number
    total: number
  }

  type UserPreviewUser = User & {
    rating?: RatingSummary | null
  }

  interface UserPreviewProps {
    user?: UserPreviewUser | null
    subtitle?: Nullable<string>
    avatarSize?: number | string
    clickable?: boolean
    rating?: RatingSummary | null
  }

  const emit = defineEmits<{
    (event: 'click'): void
  }>()

  const props = withDefaults(defineProps<UserPreviewProps>(), {
    user: null,
    subtitle: '',
    avatarSize: 42,
    clickable: false,
    rating: null,
  })

  const displayName = computed(() => getUserDisplayName(props.user))
  const ratingText = computed(() => {
    const rating = props.rating ?? props.user?.rating ?? null

    if (!rating || rating.total <= 0) {
      return ''
    }

    return `${(rating.value * 5).toFixed(1)}/5`
  })

  function handleClick() {
    if (props.clickable) {
      emit('click')
    }
  }
</script>

<style scoped>
.entity-user-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.entity-user-preview--clickable {
  cursor: pointer;
}

.entity-user-preview__avatar {
  flex-shrink: 0;
}

.entity-user-preview__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.entity-user-preview__name {
  color: #111827;
  font-size: 14px;
  font-weight: 700;
}

.entity-user-preview__rating {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 20px;
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.08);
  color: #0f766e;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.02em;
}

.entity-user-preview__subtitle {
  color: #6b7280;
  font-size: 13px;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
