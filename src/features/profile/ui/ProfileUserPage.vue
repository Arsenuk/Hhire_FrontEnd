<template>
  <ProfileView
    empty-info-text="User didn't provide information"
    empty-posts-text="User didn't provide posts"
    :error-message="errorMessage"
    :links="links"
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

<script setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { normalizePosts } from '@/entities/post/lib/normalizePost.js'
  import { normalizeUser } from '@/entities/user/lib/normalizeUser.js'
  import { api } from '@/shared/api/api.js'
  import { useSnackbar } from '@/shared/lib/composables/useSnackbar.js'
  import { useAuthStore } from '@/features/auth/model/auth.store.js'
  import { normalizeContactsToLinks } from '@/features/profile/lib/contactLinks.js'
  import ProfileView from '@/features/profile/ui/ProfileView.vue'

  const route = useRoute()
  const authStore = useAuthStore()
  const authUser = computed(() => authStore.user)

  const user = ref(null)
  const posts = ref([])
  const links = ref([])
  const errorMessage = ref('')
  const loading = ref(true)

  const isFollowing = ref(false)
  const followLoading = ref(false)
  const contactDialog = ref(false)
  const contactLoading = ref(false)
  const contactMessage = ref('')
  const { showToast, snackbar } = useSnackbar()

  const userId = ref(route.params.id)
  const canManageFollow = computed(() => Boolean(authUser.value && user.value && authUser.value.id !== user.value.id))

  async function loadUserProfile () {
    loading.value = true
    errorMessage.value = ''
    user.value = null
    posts.value = []
    links.value = []
    isFollowing.value = false

    try {
      const res = await api.get(`/users/${userId.value}/profile`)
      user.value = normalizeUser(res.data)
      posts.value = normalizePosts(res.data.posts || [])
      links.value = normalizeContactsToLinks(res.data.contacts || [])

      await checkFollowStatus()
    } catch (error) {
      console.error(error)
      errorMessage.value = 'Failed to load profile'
    } finally {
      loading.value = false
    }
  }

  async function checkFollowStatus () {
    if (!canManageFollow.value) {
      return
    }

    const res = await api.get('/follows/status', {
      params: {
        targetId: user.value.id,
        targetType: 'user',
      },
    })

    isFollowing.value = res.data.following
  }

  async function toggleFollow () {
    if (!user.value) {
      return
    }

    followLoading.value = true

    try {
      if (isFollowing.value) {
        await api.delete('/follows', {
          data: {
            targetId: user.value.id,
            targetType: 'user',
          },
        })
        isFollowing.value = false
      } else {
        await api.post('/follows', {
          targetId: user.value.id,
          targetType: 'user',
        })
        isFollowing.value = true
      }
    } finally {
      followLoading.value = false
    }
  }

  function openContactDialog () {
    contactMessage.value = ''
    contactDialog.value = true
  }

  function closeContactDialog () {
    contactDialog.value = false
  }

  async function sendSignal () {
    if (!authUser.value || !user.value) {
      showToast('Please log in to send a signal', 'warning')
      return
    }

    if (!contactMessage.value.trim()) {
      showToast('Please enter a message', 'warning')
      return
    }

    contactLoading.value = true

    try {
      await api.post('/signals', {
        sender_type: 'user',
        sender_id: authUser.value.id,
        receiver_type: 'user',
        receiver_id: user.value.id,
        message: contactMessage.value,
      })

      contactDialog.value = false
      showToast('Signal sent successfully', 'success')
    } catch (error) {
      console.error(error)
      showToast('Failed to send signal', 'error')
    } finally {
      contactLoading.value = false
    }
  }

  onMounted(loadUserProfile)

  watch(() => route.params.id, newId => {
    userId.value = newId
    closeContactDialog()
    loadUserProfile()
  })
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
