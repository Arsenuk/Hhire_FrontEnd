<template>
  <v-app>
    <AppHeader />
    <v-main class="app-main">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  import AppHeader from '@/widgets/header/ui/AppHeader.vue'
</script>

<style>
@media (max-width: 768px) {
  .app-main {
    padding-bottom: calc(var(--app-mobile-nav-height, 92px) + env(safe-area-inset-bottom));
  }
}
</style>
