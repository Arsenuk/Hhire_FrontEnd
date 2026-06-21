<template>
  <ForgotPasswordPage />
</template>

<script setup lang="ts">
  definePage({
    path: '/forgot-password',
  })

  import ForgotPasswordPage from '@/features/auth/ui/ForgotPasswordPage.vue'
</script>
