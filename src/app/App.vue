<template>
  <v-app>
    <AppHeader />
    <router-view />
  </v-app>
</template>

<script setup lang="ts">
  import AppHeader from '@/widgets/header/ui/AppHeader.vue'
</script>
