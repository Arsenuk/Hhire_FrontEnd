<template>
  <v-avatar :size="size">
    <v-img :alt="resolvedAlt" :lazy-src="defaultAvatar" :src="avatarUrl" />
  </v-avatar>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import defaultAvatar from '@/shared/assets/default-avatar.png'
  import { getUserDisplayName } from '@/entities/user/lib/getUserDisplayName'
  import { getAvatarUrl } from '@/shared/lib/media/getAvatarUrl'
  import type { User } from '@/shared/types'

  interface UserAvatarProps {
    user?: User | null
    avatar?: string
    alt?: string
    size?: number | string
  }

  const props = withDefaults(defineProps<UserAvatarProps>(), {
    user: null,
    avatar: '',
    alt: '',
    size: 40,
  })

  const avatarUrl = computed(() => getAvatarUrl(props.avatar || props.user?.avatar))
  const resolvedAlt = computed(() => props.alt || `${getUserDisplayName(props.user, 'User')} avatar`)
</script>
