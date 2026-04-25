<template>
  <v-container fluid class="profile-page">

    <!-- ================= STATUS ================= -->
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
          {{ errorMessage }}
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

        <v-col cols="12" md="6">
          <h1 class="profile-name">
            {{ user.name || "User didn't provide information" }}
          </h1>
        </v-col>

        <!-- FOLLOW BUTTON -->
        <v-col cols="12" md="4" class="text-right" v-if="authUser && authUser.id !== user.id">
          <v-btn :loading="followLoading" :color="isFollowing ? 'grey' : 'primary'" @click="toggleFollow">
            {{ isFollowing ? 'Unfollow' : 'Follow' }}
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
            <v-card-title>Useful Links</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item v-for="link in links" :key="link.id">
                  <v-list-item-title>
                    <a :href="link.url" target="_blank">
                      {{ link.description || link.url }}
                    </a>
                  </v-list-item-title>
                </v-list-item>

                <v-list-item v-if="links.length === 0">
                  <v-list-item-title>User didn't provide information</v-list-item-title>
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
                  <PostCard :post="post" variant="profile" title-placement="body" tag-prefix="#" hoverable />
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

    <v-row v-else justify="center" class="mt-10">
      <v-progress-circular indeterminate size="50" />
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api/api.js'
import { useAuthStore } from '@/stores/auth'
import PostCard from '@/components/posts/PostCard.vue'
import { getAvatarUrl, normalizePosts } from '@/utils/postDisplay.js'

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

const userId = ref(route.params.id)

async function loadUserProfile() {
  loading.value = true
  errorMessage.value = ''

  try {
    const res = await api.get(`/users/${userId.value}/profile`)
    user.value = res.data
    posts.value = normalizePosts(res.data.posts || [])
    links.value = res.data.links || []

    await checkFollowStatus()
  } catch (err) {
    console.error(err)
    errorMessage.value = 'Failed to load profile'
  } finally {
    loading.value = false
  }
}

async function checkFollowStatus() {
  if (!authUser.value || authUser.value.id === user.value.id) return

  const res = await api.get('/follows/status', {
    params: {
      targetId: user.value.id,
      targetType: 'user'
    }
  })

  isFollowing.value = res.data.following
}

async function toggleFollow() {
  followLoading.value = true

  try {
    if (isFollowing.value) {
      await api.delete('/follows', {
        data: {
          targetId: user.value.id,
          targetType: 'user'
        }
      })
      isFollowing.value = false
    } else {
      await api.post('/follows', {
        targetId: user.value.id,
        targetType: 'user'
      })
      isFollowing.value = true
    }
  } finally {
    followLoading.value = false
  }
}

onMounted(loadUserProfile)

watch(() => route.params.id, (newId) => {
  userId.value = newId
  loadUserProfile()
})

</script>

<style scoped>
/* ================= PAGE ================= */
.profile-page {
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

.profile-name h1 {
  font-size: 28px;
  font-weight: 700;
}

/* ================= CARDS ================= */
.profile-card {
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

.post-username {
  font-weight: 600;
  font-size: 15px;
}

.post-meta {
  font-size: 12px;
  color: #94a3b8;
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

  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
