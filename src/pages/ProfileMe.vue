<template>
  <ProfileView
    :user="user"
    :links="links"
    :posts="posts"
    :error-message="errorMessage"
    :success-message="successMessage"
    empty-info-text="User didn't provide information"
    empty-posts-text="User didn't provide posts"
  >
    <template #header-actions>
      <v-btn class="edit-btn" @click="editing = true">
        Edit Profile
      </v-btn>
    </template>

    <template #links-title-actions>
      <v-btn icon="mdi-plus" size="small" @click="openAddLink" />
    </template>

    <template #link-append="{ link }">
      <v-btn icon size="x-small" @click="openEditLink(link)">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn icon size="x-small" @click="openDeleteLink(link.id)">
        <v-icon color="red">mdi-delete</v-icon>
      </v-btn>
    </template>

    <template #post-actions="{ post }">
      <div v-if="isOwnPost(post)" class="post-actions">
        <v-btn icon size="x-small" @click="startEditPost(post)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon size="x-small" @click="openDeletePost(post)">
          <v-icon color="red">mdi-delete</v-icon>
        </v-btn>
      </div>
    </template>
  </ProfileView>

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
</template>


<script setup>
import ProfileView from '@/components/profile/ProfileView.vue'
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
.edit-btn {
  background: #14b8a6;
  color: #020617;
  font-weight: 600;
  border-radius: 12px;
}

.post-actions {
  display: flex;
  gap: 6px;
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

