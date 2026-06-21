<template>
  <v-container class="create-post-page pa-0" fluid>
    <v-row align="start" class="create-post-layout" justify="center">
      <v-col class="form-col" cols="12" md="6">
        <v-card class="form-card" elevation="8">
          <div class="form-card__header">
            <h2 class="form-title text-center">Create a Post</h2>
            <p class="form-subtitle text-center">
              Share your thoughts with the community
            </p>
          </div>

          <form class="post-form" @submit.prevent="openConfirm">
            <div class="post-form__scroll">
              <div class="field-group">
                <p class="form-label">Title</p>
                <input v-model="title" class="input-field" placeholder="Post title" required>
              </div>

              <div class="field-group">
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

              <div class="field-group">
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

              <div class="field-group">
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

              <div class="field-group field-group--last">
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
            </div>

            <div class="actions post-form__actions">
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
  background:
    radial-gradient(circle at top left, rgba(151, 229, 238, 0.45), transparent 28%),
    radial-gradient(circle at bottom right, rgba(211, 255, 173, 0.4), transparent 30%),
    linear-gradient(180deg, #f6f9fc 0%, #eef4f7 100%);
  box-sizing: border-box;
  min-height: 100vh;
  padding: 16px 16px 24px;
}

.create-post-layout {
  min-height: calc(100dvh - var(--app-header-height, 88px) - var(--app-mobile-nav-height, 92px) - 40px);
  padding-top: 20px;
  padding-bottom: 8px;
}

.form-col {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.form-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 520px;
  border-radius: 16px;
  margin: 0 auto;
  max-height: min(calc(100dvh - var(--app-header-height, 88px) - var(--app-mobile-nav-height, 92px) - 32px), 920px);
  overflow: hidden;
}

.form-card__header {
  flex-shrink: 0;
  padding: 32px 32px 0;
}

.form-title {
  font-family: 'Junge', serif;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
}

.form-subtitle {
  font-family: 'Junge', serif;
  font-size: 15px;
  color: #555;
  margin: 8px 0 0;
}

.post-form {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  padding: 24px 32px 32px;
}

.post-form__scroll {
  display: grid;
  gap: 20px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.field-group {
  display: grid;
  gap: 6px;
}

.field-group--last {
  padding-bottom: 2px;
}

.form-label {
  font-family: 'Junge', serif;
  font-size: 14px;
  margin: 0;
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
  flex-shrink: 0;
  margin-top: 20px;
}

.submit-btn {
  background: linear-gradient(90deg, #d3ffad 11%, #97e5ee 100%);
  color: #000;
  font-weight: 600;
  text-transform: none;
}

@media (min-width: 769px) {
  .create-post-page {
    padding: 16px 16px 24px;
  }

  .form-card {
    max-height: none;
    overflow: visible;
  }

  .post-form__scroll {
    overflow: visible;
    padding-right: 0;
  }
}

@media (max-width: 768px) {
  .create-post-page {
    min-height: calc(100dvh - var(--app-header-height, 88px) - var(--app-mobile-nav-height, 92px));
    padding: 12px 12px 28px;
  }

  .create-post-layout {
    min-height: calc(100dvh - var(--app-header-height, 88px) - var(--app-mobile-nav-height, 92px) - 24px);
    padding-top: 26px;
    padding-bottom: 18px;
  }

  .form-col {
    align-items: flex-start;
  }

  .form-card {
    max-height: calc(100dvh - var(--app-header-height, 88px) - var(--app-mobile-nav-height, 92px) - 24px);
    border-radius: 16px;
  }

  .form-card__header {
    padding: 20px 20px 0;
  }

  .post-form {
    padding: 18px 20px 20px;
  }

  .post-form__scroll {
    grid-template-columns: 1fr;
    overflow-y: auto;
    padding-right: 4px;
  }

  .actions {
    gap: 12px;
    margin-top: 16px;
  }
}
</style>
