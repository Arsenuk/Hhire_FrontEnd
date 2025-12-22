<template>
  <v-app>
    <Header />
    <router-view />
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue'
import Header from '@/components/Header.vue'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api/api'

const authStore = useAuthStore()

onMounted(async () => {
  // якщо є токен, але профіль ще не підтягнутий
  if (authStore.accessToken && !authStore.user?.avatar) {
    try {
      const res = await api.get('/users/profile')
      authStore.user = res.data
    } catch (err) {
      console.error('Failed to preload profile', err)
    }
  }
})
</script>
