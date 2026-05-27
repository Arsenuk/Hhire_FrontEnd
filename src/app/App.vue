<template>
  <v-app>
    <AppHeader />
    <router-view />
  </v-app>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useAuthStore } from '@/features/auth/model/auth.store'
  import AppHeader from '@/widgets/header/ui/AppHeader.vue'

  const authStore = useAuthStore()

  onMounted(async () => {
    // якщо є токен, але профіль ще не підтягнутий
    if (authStore.accessToken && !authStore.user?.avatar) {
      try {
        await authStore.fetchMe()
      } catch (error) {
        console.error('Failed to preload profile', error)
      }
    }
  })
</script>
