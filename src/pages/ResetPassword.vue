<template>
  <ResetPasswordPage />
</template>

<script setup lang="ts">
  definePage({
    path: '/reset-password',
  })

  import ResetPasswordPage from '@/features/auth/ui/ResetPasswordPage.vue'
</script>
