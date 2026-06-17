import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { normalizePosts } from '@/entities/post/lib/normalizePost'
import { api } from '@/shared/api/api'
import { navigateToProfile } from '@/shared/lib/navigation/navigateToProfile'
import { useAuthStore } from '@/features/auth/model/auth.store'
import { useFeedSearchStore } from '@/features/feed/model/feedSearch.store'
import type { EntityId, Post } from '@/shared/types'

type FeedSortType = 'latest'
type FeedIntent = 'general' | 'job' | 'mentorship' | 'partnership' | 'hire' | 'offer'
type FeedUserType = 'all' | 'user' | 'company'

interface FeedPost extends Post {
  company_id?: EntityId | null
  created_at?: string | null
  intent?: string | null
}

interface FilterOption<T extends string> {
  label: string
  value: T
}

interface FeedResponse {
  posts?: FeedPost[]
  nextCursor?: string | null
}

type FeedParams = {
  cursor?: string
  intents?: string
  limit?: number
  sort?: string
  tags?: string
  type?: FeedUserType
}

export function useFeed () {
  const router = useRouter()
  const authStore = useAuthStore()
  const feedSearchStore = useFeedSearchStore()

  const allPosts = ref<FeedPost[]>([])
  const posts = ref<FeedPost[]>([])

  const pageSize = 6
  const nextCursor = ref<string | null>(null)
  const hasMorePosts = ref(true)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const loadMoreTrigger = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null
  let reloadTimer: ReturnType<typeof setTimeout> | null = null
  let feedGeneration = 0
  let loadPostsToken = 0

  const sortType = ref<FeedSortType>('latest')

  const selectedIntents = ref<FeedIntent[]>([])
  const selectedTags = ref<string[]>([])
  const selectedUserType = ref<FeedUserType>('all')
  const currentUser = computed(() => authStore.user)
  const searchQuery = computed(() => feedSearchStore.query.trim())

  const intentOptions: FilterOption<FeedIntent>[] = [
    { label: 'General', value: 'general' },
    { label: 'Jobs', value: 'job' },
    { label: 'Mentorship', value: 'mentorship' },
    { label: 'Partnership', value: 'partnership' },
    { label: 'Hiring', value: 'hire' },
    { label: 'Offers', value: 'offer' },
  ]

  const userTypeOptions: FilterOption<FeedUserType>[] = [
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
      void loadMorePosts()
    }
  }

  function buildFeedParams (params: FeedParams = {}): FeedParams {
    return {
      limit: pageSize,
      sort: 'new',
      ...(searchQuery.value ? { q: searchQuery.value } : {}),
      ...(selectedIntents.value.length ? { intents: selectedIntents.value.join(',') } : {}),
      ...(selectedTags.value.length ? { tags: selectedTags.value.join(',') } : {}),
      ...(selectedUserType.value !== 'all' ? { type: selectedUserType.value } : {}),
      ...params,
    }
  }

  async function loadPosts () {
    const generation = ++feedGeneration
    const token = ++loadPostsToken
    isLoading.value = true
    hasMorePosts.value = true
    nextCursor.value = null

    try {
      const res = await api.get<FeedResponse | FeedPost[]>('/posts/feed', {
        params: buildFeedParams(),
      })
      const responseData = res.data
      const rawPosts = Array.isArray(responseData) ? responseData : responseData.posts || []

      if (generation !== feedGeneration) return

      allPosts.value = normalizePosts(rawPosts)
      posts.value = allPosts.value
      nextCursor.value = Array.isArray(responseData) ? null : responseData.nextCursor || null
      hasMorePosts.value = Boolean(nextCursor.value) && rawPosts.length === pageSize
    } catch (error) {
      console.error('Failed to load feed', error)
    } finally {
      if (token === loadPostsToken) {
        isLoading.value = false
      }
    }
  }

  async function loadMorePosts () {
    if (isLoading.value || isLoadingMore.value || !hasMorePosts.value || !nextCursor.value) return

    const generation = feedGeneration
    isLoadingMore.value = true
    let loadedSuccessfully = false

    try {
      const res = await api.get<FeedResponse>('/posts/feed', {
        params: buildFeedParams({
          cursor: nextCursor.value,
        }),
      })
      const rawPosts = res.data.posts || []
      const nextPosts = normalizePosts(rawPosts)
      const existingIds = new Set(allPosts.value.map(post => post.id))
      const uniquePosts = nextPosts.filter(post => !existingIds.has(post.id))

      if (generation !== feedGeneration) return

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
        void loadMorePosts()
      }
    }, {
      rootMargin: '240px 0px',
      threshold: 0,
    })

    observer.observe(loadMoreTrigger.value)
  }

  function toggleIntent (intent: FeedIntent) {
    if (selectedIntents.value.includes(intent)) {
      selectedIntents.value = selectedIntents.value.filter(item => item !== intent)
      return
    }

    selectedIntents.value = [...selectedIntents.value, intent]
  }

  function clearIntentFilters () {
    selectedIntents.value = []
  }

  function toggleTag (tag: string) {
    if (selectedTags.value.includes(tag)) {
      selectedTags.value = selectedTags.value.filter(item => item !== tag)
      return
    }

    selectedTags.value = [...selectedTags.value, tag]
  }

  function selectUserType (type: FeedUserType) {
    selectedUserType.value = type
  }

  function clearFilters () {
    selectedIntents.value = []
    selectedTags.value = []
    selectedUserType.value = 'all'
  }

  const sortedPosts = computed(() => {
    const result = posts.value.slice()

    return result.toSorted((a, b) => {
      const first = new Date(b.created_at || 0).getTime()
      const second = new Date(a.created_at || 0).getTime()

      return first - second
    })
  })

  const isSearchActive = computed(() => Boolean(searchQuery.value))

  const intentCounts = computed<Record<string, number>>(() => {
    const counts: Record<string, number> = {
      all: allPosts.value.length,
    }

    for (const post of allPosts.value) {
      const intent = post.intent || 'general'
      counts[intent] = (counts[intent] || 0) + 1
    }

    return counts
  })

  const userTypeCounts = computed<Record<FeedUserType, number>>(() => {
    const counts: Record<FeedUserType, number> = {
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
    const tagCounts: Record<string, number> = {}

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

  function goToProfile (userId: EntityId | null | undefined) {
    return navigateToProfile(router, userId, currentUser.value?.id)
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
    if (reloadTimer) {
      clearTimeout(reloadTimer)
      reloadTimer = null
    }
    window.removeEventListener('scroll', handleScroll)
  })

  watch(
    [
      () => selectedIntents.value.join('|'),
      () => selectedTags.value.join('|'),
      selectedUserType,
      searchQuery,
    ],
    () => {
      if (reloadTimer) {
        clearTimeout(reloadTimer)
      }

      reloadTimer = setTimeout(async () => {
        await loadPosts()
        await nextTick()

        if (isNearPageBottom()) {
          void loadMorePosts()
        }
      }, 250)
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
    isSearchActive,
    toggleIntent,
    toggleTag,
    topTags,
    userTypeCounts,
    userTypeOptions,
  }
}
