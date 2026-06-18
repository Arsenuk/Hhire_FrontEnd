<template>
  <ProfileView
    empty-info-text="User didn't provide information"
    empty-posts-text="User didn't provide posts"
    :contact-info="contacts"
    :error-message="errorMessage"
    :links="links"
    :loading="loading"
    :posts="posts"
    :show-contact-info="canViewContactInfo"
    :user="user"
  >
    <template v-if="canManageFollow" #header-actions>
      <div class="profile-actions">
        <v-btn class="contact-btn gradient-primary-btn" variant="flat" @click="openContactDialog">
          Contact
        </v-btn>

        <v-btn
          :color="isFollowing ? 'grey' : undefined"
          :class="{ 'gradient-primary-btn': !isFollowing }"
          :loading="followLoading"
          @click="toggleFollow"
        >
          {{ isFollowing ? 'Unfollow' : 'Follow' }}
        </v-btn>
      </div>
    </template>
  </ProfileView>

  <SendSignalDialog
    v-model="contactDialog"
    :context-copy="'Write a short note to introduce yourself or explain why you want to connect.'"
    context-label="Contact"
    :loading="contactLoading"
    :primary-action-label="'Send signal'"
    :target-user="user"
    :title="'Send Signal'"
    @close="closeContactDialog"
    @submit="sendSignal"
  />

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
  import { useProfileUser } from '@/features/profile/model/useProfileUser'
  import ProfileView from '@/features/profile/ui/ProfileView.vue'
  import SendSignalDialog from '@/features/signals/ui/SendSignalDialog.vue'

  const {
    canManageFollow,
    canViewContactInfo,
    closeContactDialog,
    contactDialog,
    contactLoading,
    contacts,
    errorMessage,
    followLoading,
    isFollowing,
    links,
    loading,
    openContactDialog,
    posts,
    sendSignal,
    snackbar,
    toggleFollow,
    user,
  } = useProfileUser()
</script>

<style scoped>
.profile-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.contact-btn {
  text-transform: none;
  font-weight: 600;
  border-radius: 999px;
  padding-inline: 18px;
}

.profile-actions :deep(.v-btn) {
  border-radius: 999px;
  text-transform: none;
}

.gradient-primary-btn {
  background: linear-gradient(90deg, #c3f894 0%, #4edeee 100%) !important;
  color: #020617 !important;
  font-weight: 600;
}

.gradient-primary-btn:hover {
  background: linear-gradient(90deg, #c3f894 0%, #4edeee 100%) !important;
  color: #020617 !important;
}

</style>
