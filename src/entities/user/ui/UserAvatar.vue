<template>
  <v-avatar :size="size">
    <v-img :alt="resolvedAlt" :lazy-src="defaultAvatar" :src="avatarUrl" />
  </v-avatar>
</template>

<script setup>
  import { computed } from 'vue'
  import defaultAvatar from '@/shared/assets/default-avatar.png'
  import { getUserDisplayName } from '@/entities/user/lib/getUserDisplayName.js'
  import { getAvatarUrl } from '@/shared/lib/media/getAvatarUrl'

  const props = defineProps({
    user: {
      type: Object,
      default: null,
    },
    avatar: {
      type: String,
      default: '',
    },
    alt: {
      type: String,
      default: '',
    },
    size: {
      type: [Number, String],
      default: 40,
    },
  })

  const avatarUrl = computed(() => getAvatarUrl(props.avatar || props.user?.avatar))
  const resolvedAlt = computed(() => props.alt || `${getUserDisplayName(props.user, 'User')} avatar`)
</script>
