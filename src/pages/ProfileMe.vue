<template>
  <v-container fluid class="profile-page">

    <!-- ================= STATUS ================= -->
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
          {{ errorMessage }}
        </v-alert>

        <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
          {{ successMessage }}
        </v-alert>
      </v-col>
    </v-row>

    <template v-if="user">

      <!-- ================= HEADER ================= -->
      <v-row class="profile-header mb-8" align="center">
        <v-col cols="12" md="2" class="text-center">
          <v-avatar size="120" class="avatar-border">
            <v-img :src="getAvatarUrl(user.avatar)" />
          </v-avatar>
        </v-col>

        <v-col cols="12" md="7">
          <h1 class="profile-name">
            {{ user.name || "User didn't provide information" }}
          </h1>
        </v-col>

        <v-col cols="12" md="3" class="text-md-right text-center">
          <v-btn class="edit-btn" @click="editing = true">
            Edit Profile
          </v-btn>
        </v-col>
      </v-row>

      <!-- ================= PROFILE INFO ================= -->
      <v-row class="mb-8">
        <v-col cols="12" md="8">
          <v-card class="profile-card">
            <v-card-title>Description</v-card-title>
            <v-card-text>
              {{ user.description || "User didn't provide information" }}
            </v-card-text>
          </v-card>
        </v-col>

        <!-- ================= LINKS ================= -->
        <v-col cols="12" md="4">
          <v-card class="profile-card">
            <v-card-title class="d-flex justify-space-between align-center">
              Useful Links
              <v-btn icon="mdi-plus" size="small" @click="openAddLink" />
            </v-card-title>

            <v-card-text>
              <v-list density="compact">
                <v-list-item v-for="link in links" :key="link.id">
                  <v-list-item-title>
                    <a :href="link.url" target="_blank">
                      {{ link.description || link.url }}
                    </a>
                  </v-list-item-title>

                  <template #append>
                    <v-btn icon size="x-small" @click="openEditLink(link)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon size="x-small" @click="openDeleteLink(link.id)">
                      <v-icon color="red">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>

                <v-list-item v-if="links.length === 0">
                  <v-list-item-title>
                    User didn't provide information
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ================= POSTS ================= -->
      <v-row>
        <v-col cols="12">
          <v-card class="profile-card">
            <v-card-title>Posts</v-card-title>

            <v-card-text>
              <v-row>
                <v-col v-for="post in posts" :key="post.id" cols="12" md="6">
                  <PostCard :post="post" variant="profile" title-placement="body" tag-prefix="#" hoverable>
                    <template #header-actions>
                      <div v-if="isOwnPost(post)" class="post-actions">
                        <v-btn icon size="x-small" @click="startEditPost(post)">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon size="x-small" @click="openDeletePost(post)">
                          <v-icon color="red">mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </template>
                  </PostCard>
                </v-col>

                <v-col v-if="posts.length === 0" cols="12">
                  <p>User didn't provide posts</p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

    </template>

    <!-- ================= LOADER ================= -->
    <v-row v-else justify="center" class="mt-10">
      <v-progress-circular indeterminate size="50" />
    </v-row>

    <!-- ================= EDIT PROFILE DIALOG ================= -->
    <v-dialog v-model="editing" max-width="600">
      <v-card>
        <v-card-title>Edit Profile</v-card-title>

        <v-card-text>
          <v-form ref="formRef">
            <v-text-field v-model="editForm.name" label="Name" :rules="nameRules" />
            <v-textarea v-model="editForm.description" label="Description" />
            <v-file-input v-model="editForm.avatarFile" label="Avatar" accept="image/*" />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cancelEdit">Cancel</v-btn>
          <v-btn color="primary" :loading="loading" @click="saveProfile">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ================= LINK DIALOG ================= -->
    <v-dialog v-model="showLinkDialog" max-width="500">
      <v-card>
        <v-card-title>{{ editingLink ? 'Edit Link' : 'Add Link' }}</v-card-title>

        <v-card-text>
          <v-form ref="linkFormRef">
            <v-text-field label="URL" v-model="linkForm.url" :rules="urlRules" />
            <v-text-field label="Description" v-model="linkForm.description" />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showLinkDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="loading" @click="saveLink">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ================= EDIT POST DIALOG ================= -->
    <v-dialog v-model="editingPostDialog" max-width="600">
      <v-card>
        <v-card-title>Edit Post</v-card-title>

        <v-card-text>
          <v-form ref="postFormRef">
            <v-text-field v-model="editPostForm.title" label="Title" :rules="postRules.title" />
            <v-textarea v-model="editPostForm.content" label="Content" :rules="postRules.content" />
            <v-combobox v-model="editPostForm.tags" label="Tags" multiple chips clearable hide-selected />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cancelEditPost">Cancel</v-btn>
          <v-btn color="primary" :loading="loading" @click="savePost">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ================= DELETE LINK CONFIRM ================= -->
    <v-dialog v-model="showDeleteLinkDialog" max-width="420">
      <v-card class="confirm-card">
        <v-card-title class="confirm-title">
          Delete link
        </v-card-title>

        <v-card-text class="confirm-text">
          Are you sure you want to delete this link?
          <br />
          This action cannot be undone.
        </v-card-text>

        <v-card-actions class="confirm-actions">
          <v-spacer />
          <v-btn variant="text" class="confirm-cancel" @click="showDeleteLinkDialog = false">
            Cancel
          </v-btn>
          <v-btn class="confirm-delete" :loading="loading" @click="deleteConfirmedLink">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ================= DELETE POST CONFIRM ================= -->
    <v-dialog v-model="showDeletePostDialog" max-width="420">
      <v-card class="confirm-card">
        <v-card-title class="confirm-title">
          Delete Post
        </v-card-title>

        <v-card-text class="confirm-text">
          Are you sure you want to delete this post?
          <br />
          This action cannot be undone.
        </v-card-text>

        <v-card-actions class="confirm-actions">
          <v-spacer />
          <v-btn variant="text" class="confirm-cancel" @click="showDeletePostDialog = false">
            Cancel
          </v-btn>
          <v-btn class="confirm-delete" :loading="loading" @click="deleteConfirmedPost">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>


<script setup>
import PostCard from '@/components/posts/PostCard.vue'
import { useProfileMe } from '@/composables/useProfileMe.js'

const {
  cancelEdit,
  cancelEditPost,
  deleteConfirmedLink,
  deleteConfirmedPost,
  editForm,
  editing,
  editingLink,
  editingPostDialog,
  editPostForm,
  errorMessage,
  formRef,
  getAvatarUrl,
  isOwnPost,
  linkForm,
  linkFormRef,
  links,
  loading,
  nameRules,
  openAddLink,
  openDeleteLink,
  openDeletePost,
  openEditLink,
  postFormRef,
  postRules,
  posts,
  saveLink,
  savePost,
  saveProfile,
  showDeleteLinkDialog,
  showDeletePostDialog,
  showLinkDialog,
  startEditPost,
  successMessage,
  urlRules,
  user,
} = useProfileMe()
</script>





<style scoped>
/* ================= PAGE ================= */
.profile-page {
  /* background: #0f172a; */
  background-color: #f9f9f9;
  min-height: 100vh;
  padding: clamp(80px, 10vh, 120px) 16px 16px;
  color: #e5e7eb;
}

/* ================= HEADER ================= */
.profile-header {
  background: linear-gradient(135deg, #baf2b3, #7b91f2cc);
  border-radius: 18px;
  padding: 24px;
}

.avatar-border {
  border: 3px solid #14b8a6;
}

.profile-name-col h1 {
  font-size: 28px;
  font-weight: 700;
}

/* ================= BUTTON ================= */
.edit-btn {
  background: #14b8a6;
  color: #020617;
  font-weight: 600;
  border-radius: 12px;
}

/* ================= CARDS ================= */
.profile-card {
  /* background: #020617; */
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
}

/* ================= LINKS ================= */
a {
  color: #5eead4;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* ================= POSTS ================= */
.post-card {
  /* background: #020617; */
  border-radius: 18px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.55);
}

/* ===== POST HEADER ===== */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
}

.post-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.post-user-info {
  display: flex;
  flex-direction: column;
}

.post-username {
  font-weight: 600;
  font-size: 15px;
}

.post-meta {
  font-size: 12px;
  color: #94a3b8;
}

.post-actions {
  display: flex;
  gap: 6px;
}

/* ===== POST BODY ===== */
.post-card h4 {
  font-size: 18px;
  font-weight: 600;
}

.post-card p {
  font-size: 14px;
  color: #cbd5f5;
  line-height: 1.6;
}

/* ================= TAGS ================= */
.post-tags {
  margin-top: 12px;
}

.post-tags .v-chip {
  background: rgba(20, 184, 166, 0.12);
  border-color: #14b8a6;
  color: #5eead4;
  font-weight: 500;
}

/* ================= LIST ================= */
.v-list-item {
  border-radius: 12px;
  transition: background 0.2s ease;
}

.v-list-item:hover {
  background: rgba(20, 184, 166, 0.08);
}

/* ================= EMPTY STATE ================= */
.v-card-text {
  color: #94a3b8;
}

/* ================= RESPONSIVE ================= */
@media (max-width: 960px) {
  .profile-header {
    text-align: center;
  }

  .profile-name-col {
    margin-top: 12px;
  }

  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .post-actions {
    align-self: flex-end;
  }
}

/* ================= CONFIRM DELETE ================= */
.confirm-card {
  border-radius: 18px;
  background: #ffffff;
}

.confirm-title {
  font-weight: 700;
  font-size: 18px;
  color: #020617;
}

.confirm-text {
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
}

.confirm-actions {
  padding: 12px 16px 16px;
}

/* Cancel */
.confirm-cancel {
  color: #64748b;
  font-weight: 500;
}

/* Delete */
.confirm-delete {
  background: #ef4444;
  color: #fff;
  font-weight: 600;
  border-radius: 12px;
  padding: 6px 18px;
}

.confirm-delete:hover {
  background: #dc2626;
}
</style>

