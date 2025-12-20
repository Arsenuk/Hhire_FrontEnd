<template>
  <v-container fluid class="signup-page pa-0">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" md="8">
        <v-card class="signup-card pa-8" elevation="8">

          <!-- Заголовок над прогресом -->
          <div class="signup-header text-center mb-6">
            <h2 class="signup-main-title">Create Your Account</h2>
            <p class="signup-subtitle">Join our community and start building trust</p>
          </div>

          <!-- Progress Steps -->
          <div class="progress-steps-wrapper mb-8">
            <div class="progress-steps-container">
              <div class="progress-steps">
                <div v-for="step in steps" :key="step.id" class="step-wrapper">
                  <div class="step-circle" :class="{ active: currentStep === step.id }">
                    {{ step.id }}
                  </div>
                  <p class="step-label">
                    {{ step.id === 1 ? 'Account Creation' : 'Profile Information' }}
                  </p>
                </div>
                <div class="progress-line-bg"></div>
                <div class="progress-line-active"
                  :style="{ width: ((currentStep - 1) / (steps.length - 1) * 100) + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- Кроки накладені один на одного -->
          <div class="step-container">
            <!-- Step 1: Authorization -->
            <div class="step-content" :class="{ active: currentStep === 1 }">
              <h2 class="signup-title text-center mb-4">Account Information</h2>

              <div class="custom-input mb-4">
                <v-icon size="20" color="#97e5ee" class="input-icon">mdi-account-outline</v-icon>
                <input v-model="firstName" type="text" placeholder="User Name" class="input-field" />
              </div>

              <div class="custom-input mb-4">
                <v-icon size="20" color="#97e5ee" class="input-icon">mdi-email-outline</v-icon>
                <input v-model="email" type="email" placeholder="your@example.com" class="input-field" />
              </div>

              <div class="custom-input mb-4">
                <v-icon size="20" color="#97e5ee" class="input-icon">mdi-lock-outline</v-icon>
                <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Enter password"
                  class="input-field" />
                <v-icon size="20" class="eye-icon" @click="togglePassword" color="#97e5ee">
                  {{ showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
                </v-icon>
              </div>

              <v-btn class="next-btn mt-6" block @click="nextStep">Next →</v-btn>
            </div>

            <!-- Step 2: Profile Details -->
            <div class="step-content" :class="{ active: currentStep === 2 }">
              <h2 class="signup-title text-center mb-4">Profile Details</h2>

              <div class="custom-input mb-4">
                <v-icon size="20" color="#97e5ee" class="input-icon">mdi-text-box-outline</v-icon>
                <textarea v-model="description" placeholder="Describe yourself, share your goals with us..."
                  class="input-field textarea-field"></textarea>
              </div>

              <div class="custom-input mb-4">
                <v-icon size="20" color="#97e5ee" class="input-icon">mdi-link-variant</v-icon>
                <input v-model="usefulLinks" type="text" placeholder="Add links to your social accounts..."
                  class="input-field" />
              </div>

              <div class="profile-image-upload mb-4">
                <div class="image-input-wrapper" @click="triggerFileInput">
                  <v-icon size="24" color="#97e5ee">mdi-image-outline</v-icon>
                  <div class="image-text">
                    <p>Click to upload an image</p>
                    <p v-if="profileImageName">{{ profileImageName }}</p>
                  </div>
                  <input ref="fileInput" type="file" accept="image/png" @change="handleFileUpload"
                    style="display: none" />
                </div>
              </div>

              <div class="d-flex justify-space-between">
                <v-btn class="back-btn" @click="prevStep">← Back</v-btn>
                <v-btn class="next-btn" @click="submitForm">Submit</v-btn>
              </div>
            </div>
          </div>

        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { api } from '@/api/api.js'

const router = useRouter()
const authStore = useAuthStore()

const steps = ref([{ id: 1 }, { id: 2 }])
const currentStep = ref(1)
const firstName = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const description = ref('')
const usefulLinks = ref('')
const profileImage = ref(null)
const profileImageName = ref('')

const nextStep = () => { if (currentStep.value < steps.value.length) currentStep.value++ }
const prevStep = () => { if (currentStep.value > 1) currentStep.value-- }
const togglePassword = () => { showPassword.value = !showPassword.value }
const triggerFileInput = () => { document.querySelector('input[type="file"]').click() }
const handleFileUpload = e => {
  if (e.target.files.length) {
    profileImage.value = e.target.files[0]
    profileImageName.value = e.target.files[0].name
  }
}

const submitForm = async () => {
  try {
    await api.post('/auth/register', {
      email: email.value,
      password: password.value,
      name: firstName.value
    })

    const loginRes = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    })

    authStore.user = loginRes.data.user
    localStorage.setItem('user', JSON.stringify(loginRes.data.user))

    if (profileImage.value) {
      const formData = new FormData()
      formData.append('avatar', profileImage.value)
      await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }

    await api.put('/users/profile', {
      description: description.value,
      usefulLinks: usefulLinks.value
    })

    alert('Registration and login successful!')
    router.push('/feed')
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.error || 'Registration failed')
  }
}
</script>

<style scoped>
.signup-page {
  background-color: #f7f9fc;
  min-height: 100vh;
}

/* Картка реєстрації */
.signup-card {
  border-radius: 16px;
  max-width: 600px;
  margin: 40px auto;
  padding: 32px;
  /* Встановлюємо мінімальну висоту під обидва кроки */
  min-height: 600px;
  position: relative;
  overflow: hidden; /* приховує вихідні елементи при fade */
}

/* Заголовок над прогресом */
.signup-header h2.signup-main-title {
  font-family: 'Junge', serif;
  font-size: 24px;
  font-weight: 700;
}
.signup-header p.signup-subtitle {
  font-family: 'Junge', serif;
  font-size: 16px;
  color: #555;
  margin-top: 4px;
}

/* Progress Steps Wrapper */
.progress-steps-wrapper {
  margin-bottom: 32px;
  position: relative;
}

/* Контейнер прогресу для центрирування */
.progress-steps-container {
  display: flex;
  justify-content: center;
  position: relative;
}

/* Власне лінія та кроки */
.progress-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
  width: 60%; /* Ширина прогрес-бара */
  min-width: 300px;
}

/* Окремий крок */
.step-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

/* Круг прогресу */
.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  color: #555;
  z-index: 2;
  transition: all 0.3s;
}
.step-circle.active {
  background: linear-gradient(90deg, #D3FFAD 11%, #97e5ee 100%);
  color: #000;
}

/* Підпис кроку */
.step-label {
  margin-top: 8px;
  font-size: 14px;
  font-family: 'Junge', serif;
  text-align: center;
}

/* Фонова та активна лінія прогресу */
.progress-line-bg {
  position: absolute;
  top: 20px; /* серединка кола */
  left: 0;
  right: 0;
  height: 4px;
  background-color: #ddd;
  z-index: 1;
}
.progress-line-active {
  position: absolute;
  top: 20px;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, #D3FFAD 11%, #97e5ee 100%);
  z-index: 1;
  transition: width 0.5s ease;
}

/* Контейнери кроків для накладення */
.step-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Кожен крок накладається на інший */
.step-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  opacity: 0;
  transform: translateX(20px);
  transition: opacity 0.5s ease;
  pointer-events: none;
}
.step-content.active {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

/* Заголовки кроків */
.signup-title {
  font-family: 'Junge', serif;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
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
.textarea-field {
  min-height: 80px;
  resize: none;
}

/* Eye icon для пароля */
.eye-icon {
  cursor: pointer;
}

/* Profile image upload */
.profile-image-upload .image-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #f0f0f0;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  border: 1px dashed #ddd;
  text-align: left;
}
.image-text p {
  margin: 0;
  font-size: 14px;
  color: #555;
}

/* Кнопки */
.next-btn, .back-btn {
  background: linear-gradient(90deg, #D3FFAD 11%, #97e5ee 100%);
  color: #000;
  font-family: 'Junge', serif;
  font-weight: 600;
  text-transform: none;
  transition: all 0.3s;
}
.next-btn:hover, .back-btn:hover {
  opacity: 0.9;
}
.back-btn {
  background-color: #ddd;
  color: #555;
}
</style>
