<template>
  <ProfileView
    empty-info-text="User didn't provide information"
    empty-posts-text="User didn't provide posts"
    :contact-info="contacts"
    :error-message="errorMessage"
    :links="links"
    :loading="loading"
    :posts="posts"
    :user="user"
  >
    <template v-if="canManageFollow" #header-actions>
      <div class="profile-actions">
        <v-btn class="contact-btn" color="primary" variant="flat" @click="openContactDialog">
          Contact
        </v-btn>

        <v-btn :color="isFollowing ? 'grey' : 'primary'" :loading="followLoading" @click="toggleFollow">
          {{ isFollowing ? 'Unfollow' : 'Follow' }}
        </v-btn>
      </div>
    </template>
  </ProfileView>

  <v-dialog v-model="contactDialog" max-width="520px" persistent>
    <v-card class="contact-card">
      <v-card-title class="contact-title">
        Send Signal
        <span class="to-user">to {{ user?.name }}</span>

        <v-btn icon variant="text" @click="closeContactDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-textarea
          v-model="contactMessage"
          auto-grow
          label="Write your message"
          rows="4"
          variant="outlined"
        />
      </v-card-text>

      <v-card-actions class="contact-actions">
        <v-btn class="cancel-btn" @click="closeContactDialog">
          Cancel
        </v-btn>

        <v-btn class="send-btn" :loading="contactLoading" @click="sendSignal">
          Send
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
  import { useProfileUser } from '@/features/profile/model/useProfileUser'
  import ProfileView from '@/features/profile/ui/ProfileView.vue'

  const {
    canManageFollow,
    closeContactDialog,
    contactDialog,
    contactLoading,
    contactMessage,
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
}

.contact-card {
  border-radius: 20px;
  padding: 8px;
}

.contact-title {
  align-items: center;
  display: flex;
  font-size: 16px;
  font-weight: 700;
  justify-content: space-between;
  padding: 10px 14px;
}

.to-user {
  color: #6366f1;
  font-weight: 500;
  margin-left: 6px;
}

.contact-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 12px 14px 14px;
}

.cancel-btn,
.send-btn {
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
}

.send-btn {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
}
</style>
