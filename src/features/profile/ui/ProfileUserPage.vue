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
      <v-btn :color="isFollowing ? 'grey' : 'primary'" :loading="followLoading" @click="toggleFollow">
        {{ isFollowing ? 'Unfollow' : 'Follow' }}
      </v-btn>
    </template>
  </ProfileView>
</template>

<script setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { api } from '@/api/api.js'
  import { useAuthStore } from '@/features/auth/model/auth.store.js'
  import ProfileView from '@/features/profile/ui/ProfileView.vue'
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
      user.value = res.data
      posts.value = normalizePosts(res.data.posts || [])
      links.value = res.data.links || []

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

  onMounted(loadUserProfile)

  watch(() => route.params.id, newId => {
    userId.value = newId
    loadUserProfile()
  })
</script>
