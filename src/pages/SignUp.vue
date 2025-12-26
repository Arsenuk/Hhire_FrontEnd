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
                <div class="progress-line-active" :style="{
                  width: ((currentStep - 1) / (steps.length - 1) * 100) + '%',
                  opacity: currentStep === 2 ? 0.3 : 1
                }"></div>
              </div>
            </div>
          </div>

          <!-- Step Content -->
          <transition name=" fade" mode="out-in">
            <div :key="currentStep">
              <!-- Step 1: Account Creation -->
              <div v-if="currentStep === 1" class="step-content">
                <h2 class="signup-title text-center mb-4">Account Information</h2>

                <div class="custom-input mb-4" :class="{ 'input-error': firstNameError }">
                  <v-icon size="20" color="#97e5ee" class="input-icon">mdi-account-outline</v-icon>
                  <input v-model="firstName" type="text" placeholder="User Name" class="input-field" />
                </div>
                <p v-if="firstNameError" class="error-text">{{ firstNameError }}</p>

                <div class="custom-input mb-4" :class="{ 'input-error': emailError }">
                  <v-icon size="20" color="#97e5ee" class="input-icon">mdi-email-outline</v-icon>
                  <input v-model="email" type="email" placeholder="your@example.com" class="input-field" />
                </div>
                <p v-if="emailError" class="error-text">{{ emailError }}</p>

                <div class="custom-input mb-4" :class="{ 'input-error': passwordError }">
                  <v-icon size="20" color="#97e5ee" class="input-icon">mdi-lock-outline</v-icon>
                  <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Enter password"
                    class="input-field" />
                  <v-icon size="20" class="eye-icon" @click="togglePassword" color="#97e5ee">
                    {{ showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
                  </v-icon>
                </div>
                <p v-if="passwordError" class="error-text">{{ passwordError }}</p>

                <v-btn class="next-btn mt-6" block @click="nextStep">Next →</v-btn>

                <p class="text-center mt-4">
                  Already have an account?
                  <RouterLink to="/login" class="login-link">Log In</RouterLink>
                </p>
              </div>

              <!-- Step 2: Profile Information -->
              <div v-else class="step-content">
                <h2 class="signup-title text-center mb-4">Profile Details</h2>

                <!-- Description -->
                <div class="custom-input mb-4" :class="{ 'input-error': descriptionError }">
                  <v-icon size="20" color="#97e5ee" class="input-icon">mdi-text-box-outline</v-icon>
                  <textarea v-model="description" placeholder="Describe yourself, share your goals..."
                    class="input-field textarea-field"></textarea>
                </div>
                <p v-if="descriptionError" class="error-text">{{ descriptionError }}</p>

                <!-- Avatar Upload -->
                <div class="profile-image-upload mb-4">
                  <label class="image-input-wrapper">
                    <v-icon size="24" color="#97e5ee">mdi-image-outline</v-icon>
                    <div class="image-text">
                      <p>Click to upload an image (optional)</p>
                      <p v-if="profileImageName">{{ profileImageName }}</p>
                    </div>
                    <input ref="fileInput" type="file" accept="image/*" @change="handleFileUpload"
                      style="display: none" />
                  </label>
                </div>

                <!-- Links -->
                <div v-for="(link, index) in links" :key="index" class="custom-input mb-3 link-row">
                  <v-icon size="20" color="#97e5ee" class="input-icon">mdi-link-variant</v-icon>
                  <div class="link-inputs">
                    <input v-model="link.url" type="text" placeholder="Enter link URL" class="input-field"
                      :class="{ 'input-error': link.error }" />
                    <input v-model="link.description" type="text" placeholder="Enter description"
                      class="input-field mt-2" :class="{ 'input-error': link.error }" />
                  </div>
                  <v-btn class="remove-link-btn" v-if="links.length > 1" icon small @click="removeLink(index)">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                  <p v-if="link.error" class="error-text">Both URL and description are required</p>
                </div>
                <v-btn class="add-link-btn" text small @click="addLink">+ Add another link</v-btn>

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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { register } from '@/services/authService'
import { api } from '@/api/api'

// ---------------- ROUTER / STORE ----------------
const router = useRouter()
const authStore = useAuthStore()

// ---------------- STEPS ----------------
const currentStep = ref(1)
const steps = ref([
  { id: 1, name: 'Account Creation' },
  { id: 2, name: 'Profile Information' }
])

// ---------------- STEP 1 FIELDS ----------------
const email = ref('')
const password = ref('')
const firstName = ref('')

// ---------------- STEP 2 FIELDS ----------------
const description = ref('')
const profileImageFile = ref(null)
const profileImageName = ref('')
const links = ref([{ url: '', description: '' }])

// ---------------- UI ----------------
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

// ---------------- Validation Errors ----------------
const firstNameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const descriptionError = ref('')

// ---------------- STEP NAVIGATION ----------------
function nextStep() {
  if (currentStep.value === 1) submitStepOne()
  else currentStep.value++
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

// ---------------- PASSWORD TOGGLE ----------------
function togglePassword() {
  showPassword.value = !showPassword.value
}

// ---------------- STEP 1: REGISTER + LOGIN ----------------
async function submitStepOne() {
  // Скидаємо помилки
  firstNameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  error.value = ''

  if (!firstName.value.trim()) {
    firstNameError.value = 'Please enter your name'
    return
  }
  if (!email.value.trim()) {
    emailError.value = 'Please enter your email'
    return
  }
  if (!password.value.trim() || password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return
  }

  loading.value = true
  try {
    await register(email.value.trim(), password.value.trim(), firstName.value.trim())
    await authStore.login(email.value.trim(), password.value.trim())
    currentStep.value = 2
  } catch (err) {
    console.error(err)
    error.value = 'Registration failed'
  } finally {
    loading.value = false
  }
}

// ---------------- AVATAR ----------------
function triggerFileInput() {
  document.querySelector('input[type="file"]').click()
}

function handleFileUpload(e) {
  const file = e.target.files[0]
  if (file) {
    profileImageFile.value = file
    profileImageName.value = file.name
  }
}

// ---------------- LINKS ----------------
function addLink() {
  links.value.push({ url: '', description: '' })
}

function removeLink(index) {
  if (links.value.length > 1) links.value.splice(index, 1)
}

// ---------------- STEP 2: SAVE PROFILE ----------------
async function submitForm() {
  descriptionError.value = ''
  links.value.forEach(l => l.error = false)
  error.value = ''

  if (!description.value.trim()) {
    descriptionError.value = 'Please add a description about yourself'
    return
  }

  let hasInvalidLink = false
  links.value.forEach(l => {
    if (!l.url.trim() || !l.description.trim()) {
      l.error = true
      hasInvalidLink = true
    }
  })
  if (hasInvalidLink) {
    error.value = 'Please fill all link fields'
    return
  }

  loading.value = true
  try {
    // ✅ 1. PROFILE
    await api.put('/users/profile', {
      name: firstName.value,
      description: description.value
    })

    // ✅ 2. AVATAR
    if (profileImageFile.value) {
      const formData = new FormData()
      formData.append('avatar', profileImageFile.value)

      await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }

    // ✅ 3. LINKS
    for (const link of links.value) {
      await api.post('/user-links', {
        url: link.url,
        description: link.description
      })
    }

    // ✅ 4. REDIRECT
    router.push('/feed')
  } catch (err) {
    console.error(err)
    error.value = 'Failed to save profile'
  } finally {
    loading.value = false
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

.error-text {
  color: red;
  font-size: 12px;
  margin-top: 4px;
  font-family: 'Junge', serif;
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

.login-link {
  color: #3ce18c;
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
}

.login-link:hover {
  text-decoration: underline;
}
</style>
