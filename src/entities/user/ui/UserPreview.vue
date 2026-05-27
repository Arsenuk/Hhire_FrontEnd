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

  interface UserPreviewProps {
    user?: User | null
    subtitle?: Nullable<string>
    avatarSize?: number | string
    clickable?: boolean
  }

  const emit = defineEmits<{
    (event: 'click'): void
  }>()

  const props = withDefaults(defineProps<UserPreviewProps>(), {
    user: null,
    subtitle: '',
    avatarSize: 42,
    clickable: false,
  })

  const displayName = computed(() => getUserDisplayName(props.user))

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

.entity-user-preview__subtitle {
  color: #6b7280;
  font-size: 13px;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
