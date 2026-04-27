<template>
  <div
    :class="['entity-user-preview', { 'entity-user-preview--clickable': clickable }]"
    @click="handleClick"
  >
    <UserAvatar class="entity-user-preview__avatar" :size="avatarSize" :user="user" />

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

<script setup>
  import { computed } from 'vue'
  import { getUserDisplayName } from '@/entities/user/lib/getUserDisplayName.js'
  import UserAvatar from '@/entities/user/ui/UserAvatar.vue'

  const emit = defineEmits(['click'])

  const props = defineProps({
    user: {
      type: Object,
      default: null,
    },
    subtitle: {
      type: String,
      default: '',
    },
    avatarSize: {
      type: [Number, String],
      default: 42,
    },
    clickable: {
      type: Boolean,
      default: false,
    },
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
