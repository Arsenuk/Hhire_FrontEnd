<template>
  <v-app>
    <Header />
    <router-view />
  </v-app>
</template>

<script setup>
  import { onMounted } from 'vue'
  import { api } from '@/api/api'
  import Header from '@/components/Header.vue'
  import { useAuthStore } from '@/features/auth/model/auth.store.js'

  const authStore = useAuthStore()

  onMounted(async () => {
    // якщо є токен, але профіль ще не підтягнутий
    if (authStore.accessToken && !authStore.user?.avatar) {
      try {
        const res = await api.get('/users/profile')
        authStore.user = res.data
      } catch (error) {
        console.error('Failed to preload profile', error)
      }
    }
  })
</script>
