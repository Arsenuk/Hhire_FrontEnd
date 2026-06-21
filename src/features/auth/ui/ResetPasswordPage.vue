<template>
  <v-container class="reset-password-page pa-4" fluid>
    <v-row align="center" class="fill-height" justify="center">
      <v-col cols="12" sm="10" md="6" lg="4">
        <v-card class="reset-card pa-8" elevation="10">
          <div class="text-center mb-6">
            <p class="eyebrow mb-2">Secure Reset</p>
            <h1 class="page-title">Set a new password</h1>
            <p class="page-subtitle">
              Choose a fresh password and sign in again once the update is complete.
            </p>
          </div>

          <v-alert
            v-if="tokenError"
            class="mb-4"
            color="#fde2e1"
            density="comfortable"
            variant="tonal"
          >
            {{ tokenError }}
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

          <template v-if="canSubmit">
            <p class="field-label mb-2">New Password</p>
            <div class="custom-input mb-1" :class="{ 'has-error': passwordError }">
              <v-icon class="input-icon" color="#97e5ee" size="20">mdi-lock-outline</v-icon>
              <input
                v-model="password"
                autocomplete="new-password"
                class="input-field"
                placeholder="Enter a new password"
                :type="showPassword ? 'text' : 'password'"
              >
              <v-icon class="eye-icon" color="#97e5ee" size="20" @click="showPassword = !showPassword">
                {{ showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
              </v-icon>
            </div>
            <p v-if="passwordError" class="error-text mb-4">{{ passwordError }}</p>

            <p class="field-label mb-2">Confirm Password</p>
            <div class="custom-input mb-1" :class="{ 'has-error': confirmPasswordError }">
              <v-icon class="input-icon" color="#97e5ee" size="20">mdi-lock-check-outline</v-icon>
              <input
                v-model="confirmPassword"
                autocomplete="new-password"
                class="input-field"
                placeholder="Repeat the new password"
                :type="showPassword ? 'text' : 'password'"
              >
            </div>
            <p v-if="confirmPasswordError" class="error-text mb-4">{{ confirmPasswordError }}</p>

            <v-btn
              block
              class="action-btn mb-4"
              :loading="loading"
              @click="submitForm"
            >
              Update password
            </v-btn>
          </template>

          <p class="text-center footer-text">
            <RouterLink class="footer-link" to="/LogIn">Back to login</RouterLink>
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useResetPassword } from '@/features/auth/model/useResetPassword'

  const {
    canSubmit,
    confirmPassword,
    confirmPasswordError,
    formError,
    loading,
    password,
    passwordError,
    submitForm,
    tokenError,
  } = useResetPassword()

  const showPassword = ref(false)
</script>

<style scoped>
.reset-password-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(151, 229, 238, 0.38), transparent 28%),
    radial-gradient(circle at bottom left, rgba(211, 255, 173, 0.38), transparent 30%),
    linear-gradient(180deg, #f6f9fc 0%, #eef4f7 100%);
}

.reset-card {
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

.eye-icon {
  cursor: pointer;
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
  .reset-card {
    padding: 24px !important;
  }

  .page-title {
    font-size: 24px;
  }
}
</style>
