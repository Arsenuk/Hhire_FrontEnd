import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { normalizePosts } from '@/entities/post/lib/normalizePost'
import { api } from '@/shared/api/api'
import { navigateToProfile } from '@/shared/lib/navigation/navigateToProfile'
import { useAuthStore } from '@/features/auth/model/auth.store'

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

  const selectedIntents = ref([])
  const selectedTags = ref([])
  const selectedUserType = ref('all')
  const currentUser = computed(() => authStore.user)

  const intentOptions = [
    { label: 'General', value: 'general' },
    { label: 'Jobs', value: 'job' },
    { label: 'Mentorship', value: 'mentorship' },
    { label: 'Partnership', value: 'partnership' },
    { label: 'Hiring', value: 'hire' },
    { label: 'Offers', value: 'offer' },
  ]

  const userTypeOptions = [
    { label: 'All', value: 'all' },
    { label: 'User', value: 'user' },
    { label: 'Company', value: 'company' },
  ]

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

  function buildFeedParams (params = {}) {
    return {
      limit: pageSize,
      sort: 'new',
      ...(selectedIntents.value.length ? { intents: selectedIntents.value.join(',') } : {}),
      ...(selectedTags.value.length ? { tags: selectedTags.value.join(',') } : {}),
      ...(selectedUserType.value !== 'all' ? { type: selectedUserType.value } : {}),
      ...params,
    }
  }

  async function loadPosts () {
    isLoading.value = true
    hasMorePosts.value = true
    nextCursor.value = null

    try {
      const res = await api.get('/posts/feed', {
        params: buildFeedParams(),
      })
      const rawPosts = res.data.posts || res.data || []

      allPosts.value = normalizePosts(rawPosts)
      posts.value = allPosts.value
      nextCursor.value = res.data.nextCursor || null
      hasMorePosts.value = Boolean(nextCursor.value) && rawPosts.length === pageSize

    } catch (error) {
      console.error('Failed to load feed', error)
    } finally {
      isLoading.value = false
    }
  }

  async function loadMorePosts () {
    if (isLoading.value || isLoadingMore.value || !hasMorePosts.value || !nextCursor.value) return

    isLoadingMore.value = true
    let loadedSuccessfully = false

    try {
      const res = await api.get('/posts/feed', {
        params: buildFeedParams({
          cursor: nextCursor.value,
        }),
      })
      const rawPosts = res.data.posts || []
      const nextPosts = normalizePosts(rawPosts)
      const existingIds = new Set(allPosts.value.map(post => post.id))
      const uniquePosts = nextPosts.filter(post => !existingIds.has(post.id))

      allPosts.value = [...allPosts.value, ...uniquePosts]
      posts.value = allPosts.value
      nextCursor.value = res.data.nextCursor || null
      hasMorePosts.value = Boolean(nextCursor.value) && rawPosts.length === pageSize && uniquePosts.length > 0

      loadedSuccessfully = true
    } catch (error) {
      console.error('Failed to load more feed posts', error)
      hasMorePosts.value = false
    } finally {
      isLoadingMore.value = false

      if (loadedSuccessfully && hasMorePosts.value) {
        await nextTick()

        if (isNearPageBottom()) {
          await loadMorePosts()
        }
      }
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

  function toggleIntent (intent) {
    if (selectedIntents.value.includes(intent)) {
      selectedIntents.value = selectedIntents.value.filter(item => item !== intent)
      return
    }

    selectedIntents.value = [...selectedIntents.value, intent]
  }

  function clearIntentFilters () {
    selectedIntents.value = []
  }

  function toggleTag (tag) {
    if (selectedTags.value.includes(tag)) {
      selectedTags.value = selectedTags.value.filter(item => item !== tag)
      return
    }

    selectedTags.value = [...selectedTags.value, tag]
  }

  function selectUserType (type) {
    selectedUserType.value = type
  }

  function clearFilters () {
    selectedIntents.value = []
    selectedTags.value = []
    selectedUserType.value = 'all'
  }

  const sortedPosts = computed(() => {
    const result = posts.value.slice()

    return result.toSorted((a, b) => new Date(b.created_at) - new Date(a.created_at))
  })

  const intentCounts = computed(() => {
    const counts = {
      all: allPosts.value.length,
    }

    for (const post of allPosts.value) {
      const intent = post.intent || 'general'
      counts[intent] = (counts[intent] || 0) + 1
    }

    return counts
  })

  const userTypeCounts = computed(() => {
    const counts = {
      all: allPosts.value.length,
      user: 0,
      company: 0,
    }

    for (const post of allPosts.value) {
      if (post.company_id || post.owner?.role === 'company') {
        counts.company += 1
      } else {
        counts.user += 1
      }
    }

    return counts
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

  watch(
    [() => selectedIntents.value.join('|'), () => selectedTags.value.join('|'), selectedUserType],
    async () => {
      await loadPosts()
      await nextTick()

      if (isNearPageBottom()) {
        loadMorePosts()
      }
    },
  )

  return {
    allPosts,
    clearIntentFilters,
    clearFilters,
    goToProfile,
    hasMorePosts,
    intentCounts,
    intentOptions,
    isLoading,
    isLoadingMore,
    loadMoreTrigger,
    loadMorePosts,
    posts,
    selectedIntents,
    selectedTags,
    selectedUserType,
    selectUserType,
    sortType,
    sortedPosts,
    toggleIntent,
    toggleTag,
    topTags,
    userTypeCounts,
    userTypeOptions,
  }
}
