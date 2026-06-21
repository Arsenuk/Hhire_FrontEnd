<template>
  <v-container class="forgot-password-page pa-4" fluid>
    <v-row align="center" class="fill-height" justify="center">
      <v-col cols="12" sm="10" md="6" lg="4">
        <v-card class="forgot-card pa-8" elevation="10">
          <div class="text-center mb-6">
            <p class="eyebrow mb-2">Account Recovery</p>
            <h1 class="page-title">Forgot your password?</h1>
            <p class="page-subtitle">
              Enter your email and we will send you a reset link if the account exists.
            </p>
          </div>

          <v-alert
            v-if="successMessage"
            class="mb-4"
            color="#dff7e8"
            density="comfortable"
            variant="tonal"
          >
            {{ successMessage }}
          </v-alert>

          <v-alert
            v-if="formError"
            class="mb-4"
            color="#fde2e1"
            density="comfortable"
            variant="tonal"
          >
            {{ formError }}
          </v-alert>

          <p class="field-label mb-2">Email Address</p>
          <div class="custom-input mb-1" :class="{ 'has-error': emailError }">
            <v-icon class="input-icon" color="#97e5ee" size="20">mdi-email-outline</v-icon>
            <input
              v-model="email"
              autocomplete="email"
              class="input-field"
              placeholder="your@example.com"
              type="email"
            >
          </div>
          <p v-if="emailError" class="error-text mb-4">{{ emailError }}</p>

          <v-btn
            block
            class="action-btn mb-4"
            :loading="loading"
            @click="submitForm"
          >
            Send reset link
          </v-btn>

          <p class="text-center footer-text">
            Remembered your password?
            <RouterLink class="footer-link" to="/LogIn">Back to login</RouterLink>
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { useForgotPassword } from '@/features/auth/model/useForgotPassword'

  const {
    email,
    emailError,
    formError,
    loading,
    successMessage,
    submitForm,
  } = useForgotPassword()
</script>

<style scoped>
.forgot-password-page {
  min-height: calc(100dvh - var(--app-header-height, 88px));
  background:
    radial-gradient(circle at top left, rgba(151, 229, 238, 0.45), transparent 28%),
    radial-gradient(circle at bottom right, rgba(211, 255, 173, 0.4), transparent 30%),
    linear-gradient(180deg, #f6f9fc 0%, #eef4f7 100%);
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.forgot-password-page :deep(.v-container__content) {
  width: 100%;
}

.forgot-card {
  width: 100%;
  max-width: 460px;
  border-radius: 20px;
  overflow: hidden;
}

.eyebrow {
  color: #4aa3b8;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.page-title {
  font-family: 'Junge', serif;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 12px;
}

.page-subtitle {
  color: #5f6b76;
  font-family: 'Junge', serif;
  font-size: 16px;
  line-height: 1.5;
}

.field-label {
  color: #31414f;
  font-family: 'Junge', serif;
  font-size: 14px;
  font-weight: 600;
}

.custom-input {
  align-items: center;
  background-color: #fff;
  border: 1px solid #dde6ec;
  border-radius: 14px;
  display: flex;
  padding: 12px 16px;
  transition: border 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
}

.custom-input:focus-within {
  border-color: #97e5ee;
  box-shadow: 0 8px 24px rgba(151, 229, 238, 0.25);
  transform: translateY(-1px);
}

.has-error {
  border-color: #dc2626 !important;
}

.input-icon {
  margin-right: 12px;
}

.input-field {
  border: none;
  flex: 1;
  font-family: 'Junge', serif;
  font-size: 16px;
  outline: none;
}

.error-text {
  color: #dc2626;
  font-size: 13px;
  padding-left: 4px;
}

.action-btn {
  background: linear-gradient(90deg, #d3ffad 11%, #97e5ee 100%);
  color: #000;
  font-family: 'Junge', serif;
  font-weight: 700;
  text-transform: none;
}

.footer-text {
  color: #5f6b76;
  font-family: 'Junge', serif;
}

.footer-link {
  color: #065e9f;
  font-weight: 700;
  margin-left: 4px;
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .forgot-password-page {
    min-height: calc(100dvh - var(--app-header-height, 88px) - var(--app-mobile-nav-height, 92px));
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }

  .forgot-card {
    padding: 24px !important;
  }

  .page-title {
    font-size: 24px;
  }
}
</style>
