import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { normalizePosts } from '@/entities/post/lib/normalizePost.js'
import { api } from '@/shared/api/api.js'
import { navigateToProfile } from '@/shared/lib/navigation/navigateToProfile.js'
import { useAuthStore } from '@/features/auth/model/auth.store.js'

export function useFeed () {
  const router = useRouter()
  const authStore = useAuthStore()

  const allPosts = ref([])
  const posts = ref([])

  const pageSize = 6
  const currentPage = ref(1)
  const sortType = ref('latest')

  const allTags = ref([])
  const selectedTags = ref([])
  const currentUser = computed(() => authStore.user)

  async function loadPosts () {
    try {
      const res = await api.get('/posts/feed')
      const rawPosts = res.data.posts || res.data || []

      allPosts.value = normalizePosts(rawPosts)

      const tagsSet = new Set()
      for (const post of allPosts.value) {
        if (post.tags) {
          for (const tag of post.tags) {
            tagsSet.add(tag)
          }
        }
      }

      allTags.value = Array.from(tagsSet)
      currentPage.value = 1
      posts.value = allPosts.value.slice(0, pageSize)
    } catch (error) {
      console.error('Failed to load feed', error)
    }
  }

  function loadMorePosts () {
    const nextPage = currentPage.value + 1
    posts.value = allPosts.value.slice(0, nextPage * pageSize)
    currentPage.value = nextPage
  }

  function toggleTag (tag) {
    if (selectedTags.value.includes(tag)) {
      selectedTags.value = selectedTags.value.filter(item => item !== tag)
      return
    }

    selectedTags.value.push(tag)
  }

  function clearFilters () {
    selectedTags.value = []
  }

  const sortedPosts = computed(() => {
    const result = selectedTags.value.length === 0
      ? posts.value.slice()
      : posts.value.filter(post =>
          post.tags?.some(tag => selectedTags.value.includes(tag)),
        )

    return result.toSorted((a, b) => new Date(b.created_at) - new Date(a.created_at))
  })

  const topTags = computed(() => {
    const tagCounts = {}

    for (const post of allPosts.value) {
      if (post.tags) {
        for (const tag of post.tags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        }
      }
    }

    return Object.entries(tagCounts)
      .toSorted((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag)
  })

  function goToProfile (userId) {
    navigateToProfile(router, userId, currentUser.value?.id)
  }

  onMounted(() => {
    loadPosts()
  })

  return {
    allPosts,
    allTags,
    clearFilters,
    goToProfile,
    loadMorePosts,
    posts,
    selectedTags,
    sortType,
    sortedPosts,
    toggleTag,
    topTags,
  }
}
