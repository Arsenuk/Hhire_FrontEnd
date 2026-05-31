<template>
  <v-container class="login-page pa-0" fluid>
    <v-row align="center" class="fill-height" justify="center">
      <v-col class="login-form-col" cols="12" md="6">
        <v-card class="login-card pa-8" elevation="8">
          <h2 class="login-title text-center">Welcome Back</h2>
          <p class="login-subtitle text-center mb-6">
            Sign in to continue to your account
          </p>

          <p class="login-subtitle mb-2" style="padding-left: 10px;">Email Address</p>
          <div :class="['custom-input mb-4', { 'has-error': loginError }]">
            <v-icon class="input-icon" color="#97e5ee" size="20">mdi-email-outline</v-icon>
            <input v-model="email" class="input-field" placeholder="your@example.com" type="email">
          </div>

          <p class="login-subtitle mb-2" style="padding-left: 10px;">Password</p>
          <div :class="['custom-input mb-2', { 'has-error': loginError }]">
            <v-icon class="input-icon" color="#97e5ee" size="20">mdi-lock-outline</v-icon>
            <input
              v-model="password"
              class="input-field"
              placeholder="Enter password"
              :type="showPassword ? 'text' : 'password'"
            >
            <v-icon class="eye-icon" color="#97e5ee" size="20" @click="togglePassword">
              {{ showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
            </v-icon>
          </div>

          <p v-if="loginError" class="login-error mb-4">{{ loginError }}</p>

          <div class="d-flex justify-space-between align-center mb-6">
            <v-checkbox v-model="rememberMe" class="remember-checkbox" hide-details label="Remember me" />
            <RouterLink class="forgot-link" to="/forgot-password">
              Forgot Password?
            </RouterLink>
          </div>

          <v-btn block class="login-btn mb-4" large @click="onLogin">
            Log In
          </v-btn>

          <p class="text-center">
            Don't have an account?
            <RouterLink class="signup-link" to="/signup">Sign Up</RouterLink>
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { useLogin } from '@/features/auth/model/useLogin'

  const {
    email,
    loginError,
    onLogin,
    password,
    rememberMe,
    showPassword,
    togglePassword,
  } = useLogin()
</script>

<style scoped>
.login-page {
  background-color: #f7f9fc;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 16px;
}

.login-illustration {
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #97e5ee 0%, #d3ffad 100%);
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
}

.login-form-col {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  margin: 0 auto;
}

.login-title {
  font-family: 'Junge', serif;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.login-subtitle {
  font-family: 'Junge', serif;
  font-size: 16px;
  color: #555;
}

.login-btn {
  background: linear-gradient(90deg, #D3FFAD 11%, #97e5ee 100%);
  color: #000;
  font-family: 'Junge', serif;
  font-weight: 600;
  text-transform: none;
}

.login-error {
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
  padding-left: 10px;
}

.has-error {
  border-color: #dc2626 !important;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.forgot-link {
  font-size: 14px;
  color: #065e9f;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.signup-link {
  font-weight: 600;
  color: #1f7a1f;
  text-decoration: none;
}

.signup-link:hover {
  text-decoration: underline;
}

.custom-input {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid #ddd;
  transition: border 0.3s, box-shadow 0.3s;
}

.custom-input:focus-within {
  border-color: #7ae67f;
  box-shadow: 0 4px 12px rgba(151, 229, 238, 0.3);
}

.input-icon {
  margin-right: 12px;
}

.input-field {
  border: none;
  outline: none;
  font-family: 'Junge', serif;
  font-size: 16px;
  flex: 1;
}

.eye-icon {
  cursor: pointer;
}

.remember-checkbox .v-input--selection-controls__ripple {
  display: none;
}

.remember-checkbox .v-label {
  font-size: 14px;
  color: #555;
}
</style>
