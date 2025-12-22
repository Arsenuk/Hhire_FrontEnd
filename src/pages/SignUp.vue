<template>
  <v-container fluid class="signup-page pa-0">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" md="8">
        <v-card :style="{ width: cardWidth }" class="signup-card pa-8" elevation="8">

          <!-- Заголовок -->
          <div class="signup-header text-center mb-6">
            <h2 class="signup-main-title">Create Your Account</h2>
            <p class="signup-subtitle">Join our community and start building trust</p>
          </div>

          <!-- Progress Steps -->
          <div class="progress-steps-wrapper mb-8">
            <div class="progress-steps-container">
              <div class="progress-steps">
                <div v-for="step in steps" :key="step.id" class="step-wrapper">
                  <div class="step-circle" :class="{ active: currentStep === step.id }">{{ step.id }}</div>
                  <p class="step-label">{{ step.id === 1 ? 'Account Creation' : 'Profile Information' }}</p>
                </div>
                <div class="progress-line-bg"></div>
                <div class="progress-line-active"
                  :style="{ width: ((currentStep - 1) / (steps.length - 1) * 100) + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- Step Content -->
          <transition name="fade" mode="out-in">
            <div :key="currentStep">
              <!-- Step 1: Account Creation -->
              <div v-if="currentStep === 1" class="step-content">
                <h2 class="signup-title text-center mb-4">Account Information</h2>

                <div class="custom-input mb-4">
                  <v-icon size="20" color="#97e5ee" class="input-icon">mdi-account-outline</v-icon>
                  <input v-model="firstName" type="text" placeholder="User Name" class="input-field" />
                </div>

                <div :class="['custom-input', 'mb-4', emailError ? 'input-error' : '']">
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

              <!-- Step 2: Profile Information -->
              <div v-else class="step-content">
                <h2 class="signup-title text-center mb-4">Profile Details</h2>

                <!-- Description -->
                <div class="custom-input mb-4">
                  <v-icon size="20" color="#97e5ee" class="input-icon">mdi-text-box-outline</v-icon>
                  <textarea v-model="description" placeholder="Describe yourself, share your goals..."
                    class="input-field textarea-field"></textarea>
                </div>

                <!-- Links -->
                <div v-for="(link, index) in links" :key="index" class="custom-input mb-3 link-row">
                  <v-icon size="20" color="#97e5ee" class="input-icon">mdi-link-variant</v-icon>
                  <div class="link-inputs">
                    <input v-model="link.url" type="text" placeholder="Enter link URL" class="input-field"
                      :class="{ 'input-error': link.error }" />
                    <input v-model="link.description" type="text" placeholder="Enter description"
                      class="input-field mt-2" />
                  </div>
                  <v-btn class="remove-link-btn" v-if="links.length > 1" icon small @click="removeLink(index)">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </div>
                <v-btn class="add-link-btn" text small @click="addLink">+ Add another link</v-btn>

                <!-- Profile Image Upload -->
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

                <!-- Navigation Buttons -->
                <div class="d-flex justify-space-between mt-4">
                  <v-btn class="back-btn" @click="prevStep">← Back</v-btn>
                  <v-btn class="next-btn" @click="submitForm">Submit</v-btn>
                </div>
              </div>
            </div>
          </transition>

        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>



<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { register, login } from '@/services/authService.js'
import { api } from '@/api/api.js'

const router = useRouter()
const authStore = useAuthStore()

// --- Responsive card width ---
const windowWidth = ref(window.innerWidth)
const cardWidth = computed(() => {
  if (windowWidth.value >= 1200) return '600px'
  if (windowWidth.value >= 992) return '80%'
  if (windowWidth.value >= 768) return '90%'
  return '95%'
})
const updateWidth = () => { windowWidth.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', updateWidth))
onUnmounted(() => window.removeEventListener('resize', updateWidth))

// --- Multi-step ---
const steps = ref([{ id: 1 }, { id: 2 }])
const currentStep = ref(1)

// --- Step 1: Account Creation ---
const firstName = ref('')
const email = ref('')
const emailError = ref(false)
const password = ref('')
const showPassword = ref(false)

// --- Step 2: Profile Info ---
const description = ref('')
const links = ref([{ url: '', description: '', error: false }])
const profileImage = ref(null)
const profileImageName = ref('')

// --- Navigation ---
const togglePassword = () => { showPassword.value = !showPassword.value }

const nextStep = async () => {
  if (currentStep.value === 1) {
    // Перевірка обов'язкових полів
    emailError.value = false
    if (!firstName.value.trim()) { alert('Please enter your name'); return }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      emailError.value = true
      return
    }
    if (!password.value.trim()) { alert('Please enter a password'); return }

    try {
      // Реєстрація акаунта
      await register(email.value.trim(), password.value.trim(), firstName.value.trim())

      // Логін після реєстрації
      const loginRes = await login(email.value.trim(), password.value.trim())
      authStore.user = loginRes.user
      localStorage.setItem('user', JSON.stringify(loginRes.user))

      // Перехід на другий крок
      currentStep.value++
    } catch (err) {
      alert(err.response?.data?.error || err.message)
    }
  }
}

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}

// --- File upload ---
const triggerFileInput = () => { document.querySelector('input[type="file"]').click() }
const handleFileUpload = e => {
  if (e.target.files.length) {
    profileImage.value = e.target.files[0]
    profileImageName.value = e.target.files[0].name
  }
}

// --- Links ---
const addLink = () => links.value.push({ url: '', description: '', error: false })
const removeLink = index => links.value.splice(index, 1)

// --- Submit Step 2: Profile Update ---
const submitForm = async () => {
  try {
    // --- Перевірка лінків ---
    let validLinks = true
    links.value.forEach(link => {
      link.error = !link.url.trim() || !link.description.trim()
      if (link.error) validLinks = false
    })
    if (!validLinks) { alert('Please fill all links with description'); return }

    // --- Попап для необов’язкових полів ---
    const optionalEmpty = !description.value?.trim() && !profileImage.value
    if (optionalEmpty) {
      const proceed = confirm('You have not added description or avatar. Continue without them?')
      if (!proceed) return
    }

    // --- Оновлення опису ---
    if (description.value?.trim()) {
      await api.put('/users/profile', { description: description.value.trim() })
    }

    // --- Додавання лінків ---
    for (const link of links.value) {
      if (link.url.trim() && link.description.trim()) {
        await api.post('/user-links', { url: link.url.trim(), description: link.description.trim() })
      }
    }

    // --- Завантаження аватару ---
    if (profileImage.value) {
      const formData = new FormData()
      formData.append('avatar', profileImage.value)
      await api.post('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    }

    router.push('/feed')
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.error || 'Profile update failed')
  }
}
</script>




<style scoped>
.signup-page {
  background-color: #f7f9fc;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
}

.signup-card {
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  padding: 32px;
  margin: 40px auto;
  position: relative;
  overflow: hidden;
  transition: width 0.3s ease, height 0.3s ease;
}

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

.progress-steps-wrapper {
  margin-bottom: 32px;
  position: relative;
}

.progress-steps-container {
  display: flex;
  justify-content: center;
  position: relative;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
  width: 80%;
  max-width: 100%;
  min-width: 280px;
}

.step-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

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

.step-label {
  margin-top: 8px;
  font-size: 14px;
  font-family: 'Junge', serif;
  text-align: center;
}

.progress-line-bg {
  position: absolute;
  top: 20px;
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

.input-error {
  border-color: red !important;
}

.step-content {
  width: 100%;
}

.signup-title {
  font-family: 'Junge', serif;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
}

.custom-input {
  position: relative;
  display: flex;
  align-items: flex-start;
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
  width: 100%;
  margin-bottom: 4px;
}

.textarea-field {
  min-height: 80px;
  resize: none;
}

.eye-icon {
  cursor: pointer;
}

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

.next-btn,
.back-btn {
  background: linear-gradient(90deg, #D3FFAD 11%, #97e5ee 100%);
  color: #000;
  font-family: 'Junge', serif;
  font-weight: 600;
  text-transform: none;
  transition: all 0.3s;
}

.next-btn:hover,
.back-btn:hover {
  opacity: 0.9;
}

.back-btn {
  background-color: #ddd;
  color: #555;
}

/* --- Додаткові стилі для кнопок лінків --- */
.add-link-btn {
  font-family: 'Junge', serif;
  font-size: 14px;
  font-weight: 600;
  color: #97e5ee;
  border: 1px dashed #97e5ee;
  background-color: transparent;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 12px;
}

.add-link-btn:hover {
  background-color: #97e5ee;
  color: #fff;
  border-color: #97e5ee;
}

.remove-link-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ff6b6b;
  color: #fff;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  padding: 0;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  margin-left: 8px;
}

.remove-link-btn:hover {
  background-color: #ff4c4c;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 992px) {
  .signup-card {
    padding: 24px;
  }

  .step-circle {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }

  .step-label {
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .signup-card {
    padding: 16px;
  }

  .step-circle {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }

  .step-label {
    font-size: 11px;
  }
}
</style>
