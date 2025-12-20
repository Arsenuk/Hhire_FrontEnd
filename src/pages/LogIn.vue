<template>
  <v-container fluid class="login-page pa-0">
    <v-row justify="center" align="center" class="fill-height">
      
      <v-col cols="12" md="6" class="login-form-col">
        <v-card class="login-card pa-8" elevation="8">
          <h2 class="login-title text-center">Welcome Back</h2>
          <p class="login-subtitle text-center mb-6">
            Sign in to continue to your account
          </p>

          <!-- Email Field -->
           <p class="login-subtitle  mb-2", style="padding-left: 10px;">
            Email Address
          </p>
          <div class="custom-input mb-4">
            
            <v-icon size="20" color="#97e5ee" class="input-icon">mdi-email-outline</v-icon>
            <input
              v-model="email"
              type="email"
              placeholder="your@example.com"
              class="input-field"
            />
          </div>

          <!-- Password Field -->
           <p class="login-subtitle  mb-2", style="padding-left: 10px;">
            Password
          </p>
          <div class="custom-input mb-2">
            <v-icon size="20" color="#97e5ee" class="input-icon">mdi-lock-outline</v-icon>
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="Enter password"
              class="input-field"
            />
            <v-icon
              size="20"
              class="eye-icon"
              @click="togglePassword"
              color="#97e5ee"
            >
              {{ showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
            </v-icon>
          </div>

          <!-- Remember me & Forgot Password -->
          <div class="d-flex justify-space-between align-center mb-6">
            <v-checkbox
              v-model="rememberMe"
              label="Remember me"
              class="remember-checkbox"
              hide-details
            />
            <RouterLink to="/forgot-password" class="forgot-link">
              Forgot Password?
            </RouterLink>
          </div>

          <!-- Login Button -->
          <v-btn class="login-btn mb-4" large block @click="onLogin">
            Log In
          </v-btn>

          <!-- Sign Up Link -->
          <p class="text-center">
            Don't have an account?
            <RouterLink to="/signup" class="signup-link">Sign Up</RouterLink>
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

// 🔹 викликаємо всередині setup
const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const onLogin = async () => {
  try {
    await authStore.login(email.value, password.value)
    router.push('/feed')
  } catch (err) {
    console.error('Login failed:', err.response?.data || err.message)
    alert(err.response?.data?.error || 'Login failed')
  }
}
</script>




<style scoped>
.login-page {
  background-color: #f7f9fc;
  min-height: 100vh;
}

/* Ілюстрація */
.login-illustration {
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #97e5ee 0%, #d3ffad 100%);
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
}

/* Форма */
.login-form-col {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Card */
.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
}

/* Заголовок та підзаголовок */
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

/* Кнопка логіну */
.login-btn {
  background: linear-gradient(90deg, #D3FFAD 11%, #97e5ee 100%);
  color: #000;
  font-family: 'Junge', serif;
  font-weight: 600;
  text-transform: none;
}

/* Посилання */
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

/* Кастомні поля вводу */
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
/* Eye icon for password toggle */
.eye-icon {
  cursor: pointer;
}

/* Remember checkbox */
.remember-checkbox .v-input--selection-controls__ripple {
  display: none;
}
.remember-checkbox .v-label {
  font-size: 14px;
  color: #555;
}
</style>
