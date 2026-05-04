<template>
  <v-container class="signup-page pa-0" fluid>
    <v-row align="center" class="fill-height" justify="center">
      <v-col cols="12" md="8">
        <v-card class="signup-card pa-8" elevation="8" :style="{ width: cardWidth }">
          <div class="signup-header text-center mb-6">
            <h2 class="signup-main-title">Create Your Account</h2>
            <p class="signup-subtitle">Join our community and start building trust</p>
          </div>

          <div class="progress-steps-wrapper mb-8">
            <div class="progress-steps-container">
              <div class="progress-steps">
                <div v-for="step in steps" :key="step.id" class="step-wrapper">
                  <div class="step-circle" :class="{ active: currentStep === step.id }">{{ step.id }}</div>
                  <p class="step-label">{{ step.id === 1 ? 'Account Creation' : 'Profile Information' }}</p>
                </div>
                <div class="progress-line-bg" />
                <div
                  class="progress-line-active"
                  :style="{
                    width: ((currentStep - 1) / (steps.length - 1) * 100) + '%',
                    opacity: currentStep === 2 ? 0.3 : 1,
                  }"
                />
              </div>
            </div>
          </div>

          <transition mode="out-in" name=" fade">
            <div :key="currentStep">
              <div v-if="currentStep === 1" class="step-content">
                <h2 class="signup-title text-center mb-4">Account Information</h2>

                <div class="custom-input mb-4" :class="{ 'input-error': firstNameError }">
                  <v-icon class="input-icon" color="#97e5ee" size="20">mdi-account-outline</v-icon>
                  <input v-model="firstName" class="input-field" placeholder="User Name" type="text">
                </div>
                <p v-if="firstNameError" class="error-text">{{ firstNameError }}</p>

                <div class="custom-input mb-4" :class="{ 'input-error': emailError }">
                  <v-icon class="input-icon" color="#97e5ee" size="20">mdi-email-outline</v-icon>
                  <input v-model="email" class="input-field" placeholder="your@example.com" type="email">
                </div>
                <p v-if="emailError" class="error-text">{{ emailError }}</p>

                <div class="custom-input mb-4" :class="{ 'input-error': passwordError }">
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
                <p v-if="passwordError" class="error-text">{{ passwordError }}</p>

                <v-btn block class="next-btn mt-6" @click="nextStep">Next step</v-btn>

                <p class="text-center mt-4">
                  Already have an account?
                  <RouterLink class="login-link" to="/login">Log In</RouterLink>
                </p>
              </div>

              <div v-else class="step-content">
                <h2 class="signup-title text-center mb-4">Profile Details</h2>

                <div class="custom-input mb-4" :class="{ 'input-error': descriptionError }">
                  <v-icon class="input-icon" color="#97e5ee" size="20">mdi-text-box-outline</v-icon>
                  <textarea
                    v-model="description"
                    class="input-field textarea-field"
                    placeholder="Describe yourself, share your goals..."
                  />
                </div>
                <p v-if="descriptionError" class="error-text">{{ descriptionError }}</p>

                <div class="custom-input mb-3 link-row" :class="{ 'input-error': contactInfo.error }">
                  <v-icon class="input-icon" color="#97e5ee" size="20">mdi-card-account-phone-outline</v-icon>
                  <div class="link-inputs">
                    <input
                      v-model="contactInfo.url"
                      class="input-field"
                      placeholder="Enter contact info"
                      type="text"
                    >
                    <input
                      v-model="contactInfo.description"
                      class="input-field mt-2"
                      placeholder="Enter description"
                      type="text"
                    >
                  </div>
                </div>
                <p v-if="contactInfo.error" class="error-text">{{ contactInfo.error }}</p>

                <div class="profile-image-upload mb-4">
                  <label class="image-input-wrapper">
                    <v-icon color="#97e5ee" size="24">mdi-image-outline</v-icon>
                    <div class="image-text">
                      <p>Click to upload an image (optional)</p>
                      <p v-if="profileImageName">{{ profileImageName }}</p>
                    </div>
                    <input
                      ref="fileInput"
                      accept="image/*"
                      style="display: none"
                      type="file"
                      @change="handleFileUpload"
                    >
                  </label>
                </div>

                <div v-for="(link, index) in links" :key="index" class="custom-input mb-3 link-row">
                  <v-icon class="input-icon" color="#97e5ee" size="20">mdi-link-variant</v-icon>
                  <div class="link-inputs">
                    <input
                      v-model="link.url"
                      class="input-field"
                      :class="{ 'input-error': link.error }"
                      placeholder="Enter link URL"
                      type="text"
                    >
                    <input
                      v-model="link.description"
                      class="input-field mt-2"
                      :class="{ 'input-error': link.error }"
                      placeholder="Enter description"
                      type="text"
                    >
                  </div>
                  <v-btn
                    v-if="links.length > 1"
                    class="remove-link-btn"
                    icon
                    small
                    @click="removeLink(index)"
                  >
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                  <p v-if="link.error" class="error-text">{{ link.error }}</p>
                </div>
                <v-btn class="add-link-btn" small text @click="addLink">+ Add another link</v-btn>

                <div class="d-flex justify-space-between mt-4">
                  <v-btn class="back-btn" @click="prevStep">Back to step 1</v-btn>
                  <v-btn class="next-btn" :loading="loading" @click="submitForm">Submit</v-btn>
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
  import { useSignUp } from '@/features/auth/model/useSignUp.js'

  const {
    addLink,
    cardWidth,
    contactInfo,
    currentStep,
    description,
    descriptionError,
    email,
    emailError,
    firstName,
    firstNameError,
    handleFileUpload,
    links,
    loading,
    nextStep,
    password,
    passwordError,
    prevStep,
    profileImageName,
    removeLink,
    showPassword,
    steps,
    submitForm,
    togglePassword,
  } = useSignUp()
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
