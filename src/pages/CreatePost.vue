<template>
  <v-container fluid class="create-post-page pa-0">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" md="6" class="form-col">
        <v-card class="form-card pa-8" elevation="8">
          <h2 class="form-title text-center">Create a Post</h2>
          <p class="form-subtitle text-center mb-6">
            Share your thoughts or write a company review
          </p>

          <!-- 🔥 Post type switch -->
          <div class="post-type-switch mb-6">
            <v-btn
              :class="postType === 'social' ? 'selected-type' : 'unselected-type'"
              @click="postType = 'social'"
            >
              Social Post
            </v-btn>

            <v-btn
              :class="postType === 'review' ? 'selected-type review' : 'unselected-type'"
              @click="postType = 'review'"
            >
              Company Review
            </v-btn>
          </div>

          <!-- FORM -->
          <form @submit.prevent="submitPost">
            <!-- Company select (review only) -->
            <div v-if="postType === 'review'" class="mb-5">
              <p class="form-label">Company</p>
              <div class="custom-input">
                <v-icon size="20" color="#97e5ee" class="input-icon">
                  mdi-domain
                </v-icon>
                <select v-model="company" class="input-field">
                  <option value="">Select company</option>
                  <option v-for="c in companies" :key="c" :value="c">
                    {{ c }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Rating (review only) -->
            <div v-if="postType === 'review'" class="mb-5">
              <p class="form-label">Rating</p>
              <div class="rating-row">
                <v-icon
                  v-for="star in 5"
                  :key="star"
                  size="28"
                  class="star"
                  :color="star <= rating ? '#f59e0b' : '#ddd'"
                  @click="rating = star"
                >
                  mdi-star
                </v-icon>
                <span v-if="rating" class="rating-text">
                  {{ rating }} / 5
                </span>
              </div>
            </div>

            <!-- Content -->
            <div class="mb-6">
              <p class="form-label">
                {{ postType === 'review' ? 'Your review' : 'What’s on your mind?' }}
              </p>
              <textarea
                v-model="content"
                rows="6"
                class="textarea"
                placeholder="Write something..."
                required
              ></textarea>
              <div class="char-count">
                {{ content.length }} characters
              </div>
            </div>

            <!-- Actions -->
            <div class="actions">
              <v-btn variant="outlined" @click="cancel">
                Cancel
              </v-btn>

              <v-btn class="submit-btn" type="submit">
                Publish
              </v-btn>
            </div>
          </form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const postType = ref('social')
const content = ref('')
const company = ref('')
const rating = ref(0)

// mock, потім заміниш API
const companies = [
  'TechCorp Solutions',
  'GreenLeaf Industries',
  'CloudServe Pro'
]

const submitPost = () => {
  console.log({
    type: postType.value,
    content: content.value,
    company: company.value,
    rating: rating.value
  })

  router.push('/Feed')
}

const cancel = () => {
  router.push('/Feed')
}
</script>

<style scoped>
.create-post-page {
  background-color: #f7f9fc;
  min-height: 100vh;
}

.form-col {
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-card {
  width: 100%;
  max-width: 480px;
  border-radius: 16px;
}

/* Title */
.form-title {
  font-family: 'Junge', serif;
  font-size: 26px;
  font-weight: 700;
}

.form-subtitle {
  font-family: 'Junge', serif;
  font-size: 15px;
  color: #555;
}

/* Post type buttons */
.post-type-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.post-type-switch .v-btn {
  width: 100%;
  height: 56px;
  text-transform: none;
  font-family: 'Junge', serif;
}

.selected-type {
  background: linear-gradient(90deg, #d3ffad 11%, #97e5ee 100%);
  color: #000;
  font-weight: 600;
}

.selected-type.review {
  background: linear-gradient(90deg, #fde68a 0%, #f59e0b 100%);
}

.unselected-type {
  border: 1px solid #ddd;
  background: #fff;
}

/* Inputs */
.form-label {
  font-family: 'Junge', serif;
  font-size: 14px;
  margin-bottom: 6px;
  padding-left: 10px;
}

.custom-input {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 12px 16px;
  background: #fff;
}

.input-icon {
  margin-right: 12px;
}

.input-field {
  border: none;
  outline: none;
  flex: 1;
  font-family: 'Junge', serif;
  font-size: 15px;
}

/* Rating */
.rating-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.star {
  cursor: pointer;
}

.rating-text {
  margin-left: 8px;
  font-size: 14px;
  color: #555;
}

/* Textarea */
.textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 14px;
  resize: none;
  font-family: 'Junge', serif;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #777;
  margin-top: 4px;
}

/* Actions */
.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.submit-btn {
  background: linear-gradient(90deg, #d3ffad 11%, #97e5ee 100%);
  color: #000;
  font-weight: 600;
  text-transform: none;
}
</style>
