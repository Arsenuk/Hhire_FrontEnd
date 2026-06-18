<template>
  <ProfileView
    empty-info-text="User didn't provide information"
    empty-posts-text="User didn't provide posts"
    :contact-info="contacts"
    :error-message="errorMessage"
    :links="links"
    :loading="loading"
    :posts="posts"
    :rating="rating"
    :success-message="successMessage"
    :show-rating-breakdown="showRatingBreakdown"
    :user="user"
  >
    <template #header-actions>
      <div class="profile-edit-actions">
        <template v-if="editMode">
          <v-btn class="edit-btn gradient-primary-btn" variant="tonal" @click="openProfileEditor">
            Edit Info
          </v-btn>
          <v-btn class="done-btn" variant="text" @click="closeEditMode">
            Done
          </v-btn>
        </template>

        <v-btn v-else class="edit-btn gradient-primary-btn" @click="openEditMode">
          Edit Profile
        </v-btn>
      </div>
    </template>

    <template #links-title-actions>
      <v-btn v-if="editMode" icon="mdi-plus" size="small" @click="openAddLink" />
    </template>

    <template #contact-title-actions>
      <div v-if="editMode" class="contact-title-actions">
        <v-btn icon="mdi-plus" size="small" @click="openAddContact" />
      </div>
    </template>

    <template #contact-append="{ contact }">
      <template v-if="editMode">
        <v-btn icon size="x-small" @click="openEditContact(contact)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon size="x-small" @click="openDeleteContact(contact.id)">
          <v-icon color="red">mdi-delete</v-icon>
        </v-btn>
      </template>
    </template>

    <template #link-append="{ link }">
      <template v-if="editMode">
        <v-btn icon size="x-small" @click="openEditLink(link)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon size="x-small" @click="openDeleteLink(link.id)">
          <v-icon color="red">mdi-delete</v-icon>
        </v-btn>
      </template>
    </template>

    <template #post-actions="{ post }">
      <div v-if="editMode && isOwnPost(post)" class="post-actions">
        <v-btn icon size="x-small" @click="startEditPost(post)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon size="x-small" @click="openDeletePost(post)">
          <v-icon color="red">mdi-delete</v-icon>
        </v-btn>
      </div>
    </template>
  </ProfileView>

  <v-dialog v-model="profileEditorOpen" max-width="600">
    <v-card class="profile-dialog-card">
      <v-card-title>Edit Profile</v-card-title>

      <v-card-text class="profile-dialog__body">
        <v-form ref="formRef">
          <v-text-field v-model="editForm.name" label="Name" :rules="nameRules" />
          <v-textarea v-model="editForm.description" label="Description" />
          <v-file-input v-model="editForm.avatarFile" accept="image/*" label="Avatar" />
        </v-form>
      </v-card-text>

      <v-card-actions class="profile-dialog__actions">
        <v-spacer />
        <v-btn variant="text" @click="cancelEdit">Cancel</v-btn>
        <v-btn class="gradient-primary-btn" :loading="loading" @click="saveProfile">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showContactDialog" max-width="500">
    <v-card class="profile-dialog-card">
      <v-card-title>{{ editingContact ? 'Edit Contact' : 'Add Contact' }}</v-card-title>

      <v-card-text class="profile-dialog__body">
        <v-form ref="contactFormRef">
          <v-text-field v-model="contactForm.url" label="Contact" :rules="contactRules" />
          <v-text-field v-model="contactForm.description" label="Label" />
        </v-form>
      </v-card-text>

      <v-card-actions class="profile-dialog__actions">
        <v-spacer />
        <v-btn variant="text" @click="showContactDialog = false">Cancel</v-btn>
        <v-btn class="gradient-primary-btn" :loading="loading" @click="saveContact">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showLinkDialog" max-width="500">
    <v-card class="profile-dialog-card">
      <v-card-title>{{ editingLink ? 'Edit Link' : 'Add Link' }}</v-card-title>

      <v-card-text class="profile-dialog__body">
        <v-form ref="linkFormRef">
          <v-text-field v-model="linkForm.url" label="URL" :rules="urlRules" />
          <v-text-field v-model="linkForm.description" label="Label" />
        </v-form>
      </v-card-text>

      <v-card-actions class="profile-dialog__actions">
        <v-spacer />
        <v-btn variant="text" @click="showLinkDialog = false">Cancel</v-btn>
        <v-btn class="gradient-primary-btn" :loading="loading" @click="saveLink">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="editingPostDialog" max-width="600">
    <v-card class="profile-dialog-card">
      <v-card-title>Edit Post</v-card-title>

      <v-card-text class="profile-dialog__body">
        <v-form ref="postFormRef">
          <v-text-field v-model="editPostForm.title" label="Title" :rules="postRules.title" />
          <v-textarea v-model="editPostForm.content" label="Content" :rules="postRules.content" />
          <v-select
            v-model="editPostForm.intent"
            item-title="label"
            item-value="value"
            :items="intentOptions"
            label="Intent"
          />
          <v-combobox
            v-model="editPostForm.tags"
            chips
            clearable
            hide-selected
            label="Tags"
            multiple
            :rules="postRules.tags"
          />
          <v-checkbox
            v-model="editPostForm.removeImages"
            density="compact"
            hide-details
            label="Remove current images"
          />
          <v-file-input
            v-model="editPostForm.imageFiles"
            accept="image/*"
            label="Replace images"
            multiple
            show-size
          />
        </v-form>
      </v-card-text>

      <v-card-actions class="profile-dialog__actions">
        <v-spacer />
        <v-btn variant="text" @click="cancelEditPost">Cancel</v-btn>
        <v-btn class="gradient-primary-btn" :loading="loading" @click="savePost">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showDeleteContactDialog" max-width="420">
    <v-card class="confirm-card">
      <v-card-title class="confirm-title">
        Delete contact
      </v-card-title>

      <v-card-text class="confirm-text">
        Are you sure you want to delete this contact?
        <br>
        This action cannot be undone.
      </v-card-text>

      <v-card-actions class="confirm-actions">
        <v-spacer />
        <v-btn class="confirm-cancel" variant="text" @click="showDeleteContactDialog = false">
          Cancel
        </v-btn>
        <v-btn class="confirm-delete" :loading="loading" @click="deleteConfirmedContact">
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showDeleteLinkDialog" max-width="420">
    <v-card class="confirm-card">
      <v-card-title class="confirm-title">
        Delete link
      </v-card-title>

      <v-card-text class="confirm-text">
        Are you sure you want to delete this link?
        <br>
        This action cannot be undone.
      </v-card-text>

      <v-card-actions class="confirm-actions">
        <v-spacer />
        <v-btn class="confirm-cancel" variant="text" @click="showDeleteLinkDialog = false">
          Cancel
        </v-btn>
        <v-btn class="confirm-delete" :loading="loading" @click="deleteConfirmedLink">
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showDeletePostDialog" max-width="420">
    <v-card class="confirm-card">
      <v-card-title class="confirm-title">
        Delete Post
      </v-card-title>

      <v-card-text class="confirm-text">
        Are you sure you want to delete this post?
        <br>
        This action cannot be undone.
      </v-card-text>

      <v-card-actions class="confirm-actions">
        <v-spacer />
        <v-btn class="confirm-cancel" variant="text" @click="showDeletePostDialog = false">
          Cancel
        </v-btn>
        <v-btn class="confirm-delete" :loading="loading" @click="deleteConfirmedPost">
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    location="bottom"
    multi-line
    rounded="pill"
    timeout="2500"
  >
    {{ snackbar.text }}
  </v-snackbar>
</template>

<script setup lang="ts">
  import { useProfileMe } from '@/features/profile/model/useProfileMe'
  import ProfileView from '@/features/profile/ui/ProfileView.vue'

  const {
    cancelEdit,
    cancelEditPost,
    contactForm,
    contactFormRef,
    contactRules,
    contacts,
    closeEditMode,
    deleteConfirmedContact,
    deleteConfirmedLink,
    deleteConfirmedPost,
    editForm,
    editMode,
    editingContact,
    editingLink,
    editingPostDialog,
    editPostForm,
    errorMessage,
    formRef,
    intentOptions,
    isOwnPost,
    linkForm,
    linkFormRef,
    links,
    loading,
    nameRules,
    openAddContact,
    openAddLink,
    openDeleteContact,
    openDeleteLink,
    openDeletePost,
    openEditMode,
    openEditContact,
    openEditLink,
    openProfileEditor,
    postFormRef,
    postRules,
    posts,
    profileEditorOpen,
    rating,
    showRatingBreakdown,
    saveLink,
    savePost,
    saveContact,
    saveProfile,
    showContactDialog,
    showDeleteContactDialog,
    showDeleteLinkDialog,
    showDeletePostDialog,
    showLinkDialog,
    startEditPost,
    snackbar,
    successMessage,
    urlRules,
    user,
  } = useProfileMe()
</script>

<style scoped>
.edit-btn {
  background: linear-gradient(90deg, #c3f894 0%, #4edeee 100%) !important;
  color: #020617 !important;
  font-weight: 600;
  text-transform: none;
  padding-inline: 18px;
}

.profile-edit-actions {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.done-btn {
  color: #020617;
  font-weight: 600;
  text-transform: none;
}

.post-actions {
  display: flex;
  gap: 6px;
}

.contact-title-actions {
  display: inline-flex;
  gap: 6px;
}

.contact-title-actions :deep(.v-btn),
.profile-edit-actions :deep(.v-btn) {
  border-radius: 999px;
}

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

.confirm-cancel {
  color: #64748b;
  font-weight: 500;
}

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

.confirm-save {
  background: #14b8a6;
  color: #020617;
  font-weight: 600;
  border-radius: 12px;
  padding: 6px 18px;
}

.confirm-save:hover {
  background: #0f766e;
  color: #fff;
}

.profile-dialog-card {
  display: flex;
  flex-direction: column;
  max-height: min(90vh, 780px);
  overflow: hidden;
  border-radius: 18px;
}

.profile-dialog__body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.profile-dialog__actions {
  flex-shrink: 0;
}

.gradient-primary-btn {
  background: linear-gradient(90deg, #c3f894 0%, #4edeee 100%) !important;
  color: #020617 !important;
  font-weight: 600;
  text-transform: none;
}

.gradient-primary-btn:hover {
  background: linear-gradient(90deg, #c3f894 0%, #4edeee 100%) !important;
  color: #020617 !important;
}
</style>
