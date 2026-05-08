<template>
  <v-app>
    <AppHeader />
    <router-view />
  </v-app>
</template>

<script setup>
  import { onMounted } from 'vue'
  import { normalizeUser } from '@/entities/user/lib/normalizeUser.js'
  import { useAuthStore } from '@/features/auth/model/auth.store.js'
  import { api } from '@/shared/api/api.js'
  import AppHeader from '@/widgets/header/ui/AppHeader.vue'

  const authStore = useAuthStore()

  onMounted(async () => {
    // якщо є токен, але профіль ще не підтягнутий
    if (authStore.accessToken && !authStore.user?.avatar) {
      try {
        const res = await api.get('/me')
        authStore.user = normalizeUser(res.data)
      } catch (error) {
        console.error('Failed to preload profile', error)
      }
    }
  })
</script>
