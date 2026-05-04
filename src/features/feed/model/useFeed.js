import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
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
  const nextCursor = ref(null)
  const hasMorePosts = ref(true)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const loadMoreTrigger = ref(null)
  let observer = null

  const sortType = ref('latest')

  const allTags = ref([])
  const selectedTags = ref([])
  const currentUser = computed(() => authStore.user)

  function isNearPageBottom () {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const viewportHeight = window.innerHeight
    const pageHeight = document.documentElement.scrollHeight

    return scrollTop + viewportHeight >= pageHeight - 240
  }

  function handleScroll () {
    if (isNearPageBottom()) {
      loadMorePosts()
    }
  }

  function updateTags () {
    const tagsSet = new Set()

    for (const post of allPosts.value) {
      if (post.tags) {
        for (const tag of post.tags) {
          tagsSet.add(tag)
        }
      }
    }

    allTags.value = Array.from(tagsSet)
  }

  async function loadPosts () {
    isLoading.value = true
    hasMorePosts.value = true
    nextCursor.value = null

    try {
      const res = await api.get('/posts/feed', {
        params: {
          limit: pageSize,
          sort: 'new',
        },
      })
      const rawPosts = res.data.posts || res.data || []

      allPosts.value = normalizePosts(rawPosts)
      posts.value = allPosts.value
      nextCursor.value = res.data.nextCursor || null
      hasMorePosts.value = Boolean(nextCursor.value) && rawPosts.length === pageSize

      updateTags()
    } catch (error) {
      console.error('Failed to load feed', error)
    } finally {
      isLoading.value = false
    }
  }

  async function loadMorePosts () {
    if (isLoading.value || isLoadingMore.value || !hasMorePosts.value) return

    isLoadingMore.value = true

    try {
      const res = await api.get('/posts/feed', {
        params: {
          cursor: nextCursor.value,
          limit: pageSize,
          sort: 'new',
        },
      })
      const rawPosts = res.data.posts || []
      const nextPosts = normalizePosts(rawPosts)
      const existingIds = new Set(allPosts.value.map(post => post.id))
      const uniquePosts = nextPosts.filter(post => !existingIds.has(post.id))

      allPosts.value = [...allPosts.value, ...uniquePosts]
      posts.value = allPosts.value
      nextCursor.value = res.data.nextCursor || null
      hasMorePosts.value = Boolean(nextCursor.value) && rawPosts.length === pageSize

      updateTags()
    } catch (error) {
      console.error('Failed to load more feed posts', error)
    } finally {
      isLoadingMore.value = false
    }
  }

  function setupInfiniteScroll () {
    if (!loadMoreTrigger.value || observer || typeof IntersectionObserver === 'undefined') return

    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        loadMorePosts()
      }
    }, {
      rootMargin: '240px 0px',
      threshold: 0,
    })

    observer.observe(loadMoreTrigger.value)
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

  onMounted(async () => {
    await loadPosts()
    await nextTick()
    setupInfiniteScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    allPosts,
    allTags,
    clearFilters,
    goToProfile,
    hasMorePosts,
    isLoading,
    isLoadingMore,
    loadMoreTrigger,
    loadMorePosts,
    posts,
    selectedTags,
    sortType,
    sortedPosts,
    toggleTag,
    topTags,
  }
}
