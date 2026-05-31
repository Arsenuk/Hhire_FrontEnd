<template>
  <v-container class="create-post-page pa-0" fluid>
    <v-row align="center" class="fill-height" justify="center">
      <v-col class="form-col" cols="12" md="6">
        <v-card class="form-card pa-8" elevation="8">

          <h2 class="form-title text-center">Create a Post</h2>
          <p class="form-subtitle text-center mb-6">
            Share your thoughts with the community
          </p>

          <form @submit.prevent="openConfirm">
            <div class="mb-5">
              <p class="form-label">Title</p>
              <input v-model="title" class="input-field" placeholder="Post title" required>
            </div>

            <div class="mb-6">
              <p class="form-label">Content</p>
              <textarea
                v-model="content"
                class="textarea"
                placeholder="Write your post..."
                required
                rows="6"
              />

              <div class="char-count">
                {{ content.length }} characters
              </div>
            </div>

            <div class="mb-6">
              <p class="form-label">Intent</p>

              <v-select
                v-model="intent"
                density="comfortable"
                item-title="label"
                item-value="value"
                :items="intentOptions"
                placeholder="Select intent"
              />
            </div>

            <div class="mb-6">
              <p class="form-label">Tags</p>
              <v-combobox
                v-model="tags"
                chips
                clearable
                hide-selected
                label="Tags"
                multiple
                :rules="tagRules"
              />
              <div class="char-count">
                Up to 10 tags
              </div>
            </div>

            <div class="mb-6">
              <p class="form-label">Images</p>

              <v-file-input
                v-model="images"
                accept="image/*"
                density="comfortable"
                label="Upload images"
                multiple
                show-size
              />
            </div>

            <div class="actions">
              <v-btn variant="outlined" @click="cancel">
                Cancel
              </v-btn>

              <v-btn class="submit-btn" type="submit">
                Publish
              </v-btn>
            </div>
          </form>

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
  import { useCreatePost } from '@/features/create-post/model/useCreatePost'

  const {
    cancel,
    confirmSubmit,
    content,
    images,
    intent,
    intentOptions,
    openConfirm,
    showConfirm,
    submitting,
    tagRules,
    tags,
    title,
  } = useCreatePost()
</script>

<style scoped>
.create-post-page {
  background-color: #f7f9fc;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 16px;
}

.form-col {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.form-card {
  width: 100%;
  max-width: 520px;
  border-radius: 16px;
  margin: 0 auto;
}

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
