<template>
  <ProfileView
    :user="user"
    :links="links"
    :posts="posts"
    :error-message="errorMessage"
    empty-info-text="User didn't provide information"
    empty-posts-text="User didn't provide posts"
  >
    <template v-if="authUser && authUser.id !== user.id" #header-actions>
      <v-btn :loading="followLoading" :color="isFollowing ? 'grey' : 'primary'" @click="toggleFollow">
        {{ isFollowing ? 'Unfollow' : 'Follow' }}
      </v-btn>
    </template>
  </ProfileView>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api/api.js'
import { useAuthStore } from '@/stores/auth'
import ProfileView from '@/components/profile/ProfileView.vue'
import { normalizePosts } from '@/utils/postDisplay.js'

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
</style>
