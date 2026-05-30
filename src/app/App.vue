<template>
  <v-app>
    <AppHeader />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  import AppHeader from '@/widgets/header/ui/AppHeader.vue'
</script>
