<template>
  <v-container fluid class="create-post-page pa-0">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" md="6" class="form-col">
        <v-card class="form-card pa-8" elevation="8">

          <h2 class="form-title text-center">Create a Post</h2>
          <p class="form-subtitle text-center mb-6">
            Share your thoughts with the community
          </p>

          <form @submit.prevent="openConfirm">

            <!-- TITLE -->
            <div class="mb-5">
              <p class="form-label">Title</p>
              <input v-model="title" class="input-field" placeholder="Post title" required />
            </div>

            <!-- CONTENT -->
            <div class="mb-6">
              <p class="form-label">Content</p>
              <textarea v-model="content" rows="6" class="textarea" placeholder="Write your post..."
                required></textarea>

              <div class="char-count">
                {{ content.length }} characters
              </div>
            </div>

            <!-- INTENT (НОВЕ ПОЛЕ) -->
            <div class="mb-6">
              <p class="form-label">Intent</p>

              <v-select v-model="intent" :items="intentOptions" item-title="label" item-value="value"
                placeholder="Select intent" density="comfortable" />
            </div>

            <!-- TAGS -->
            <div class="mb-6">
              <p class="form-label">Tags</p>
              <input v-model="rawTags" class="input-field" placeholder="e.g. startup, tech, review" />
              <div class="char-count">
                Up to 10 tags, separated by commas
              </div>
            </div>

          
            <!-- IMAGES (НОВЕ ПОЛЕ) -->
            <div class="mb-6">
              <p class="form-label">Images</p>

              <v-file-input v-model="images" multiple accept="image/*" show-size density="comfortable"
                label="Upload images" />
            </div>

            <!-- ACTIONS -->
            <div class="actions">
              <v-btn variant="outlined" @click="cancel">
                Cancel
              </v-btn>

              <v-btn class="submit-btn" type="submit">
                Publish
              </v-btn>
            </div>

          </form>

          <!-- CONFIRM -->
          <v-dialog v-model="showConfirm" max-width="420">
            <v-card>
              <v-card-title class="text-h6">
                Confirm publication
              </v-card-title>

              <v-card-text>
                Are you sure you want to publish this post?
              </v-card-text>

              <v-card-actions>
                <v-spacer />

                <v-btn variant="text" @click="showConfirm = false">
                  Cancel
                </v-btn>

                <v-btn class="submit-btn" :loading="submitting" @click="confirmSubmit">
                  Publish
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api/api.js'

const router = useRouter()

const title = ref('')
const content = ref('')
const rawTags = ref('')
const intent = ref('general')
const images = ref([])


const showConfirm = ref(false)
const submitting = ref(false)

// --- INTENTS (з беку) ---
const intentOptions = [
  { label: 'General', value: 'general' },
  { label: 'Job', value: 'job' },
  { label: 'Mentorship', value: 'mentorship' },
  { label: 'Partnership', value: 'partnership' },
  { label: 'Hire', value: 'hire' },
  { label: 'Offer', value: 'offer' }
]

const openConfirm = () => {
  showConfirm.value = true
}

const confirmSubmit = async () => {
  showConfirm.value = false
  await submitPost()
}

const submitPost = async () => {
  if (submitting.value) return
  submitting.value = true

  try {
    const tags = rawTags.value
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 10)

      
    const formData = new FormData()

    formData.append('title', title.value)
    formData.append('content', content.value)
    formData.append('intent', intent.value)

    formData.append('sender_type', 'user')

    tags.forEach(tag => formData.append('tags[]', tag))

    images.value.forEach(file => {
      formData.append('images', file)
    })

    await api.post('/posts/user', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    router.push('/feed')
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.message ||
      err.response?.data?.error ||
      'Failed to create post')
  } finally {
    submitting.value = false
  }
}

const cancel = () => {
  router.push('/feed')
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
  max-width: 520px;
  border-radius: 16px;
}

/* Titles */
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

/* Inputs */
.form-label {
  font-family: 'Junge', serif;
  font-size: 14px;
  margin-bottom: 6px;
}

.input-field {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 12px 14px;
  font-family: 'Junge', serif;
}

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
