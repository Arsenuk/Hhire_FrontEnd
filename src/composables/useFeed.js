import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api/api.js'
import { useAuthStore } from '@/stores/auth.js'
import { getAvatarUrl, normalizePosts } from '@/utils/postDisplay.js'

export function useFeed() {
  const router = useRouter()
  const authStore = useAuthStore()

  const allPosts = ref([])
  const posts = ref([])
  const expandedPosts = ref([])

  const pageSize = 6
  const currentPage = ref(1)
  const sortType = ref('latest')

  const allTags = ref([])
  const selectedTags = ref([])

  const newComment = ref({})
  const editContent = ref({})
  const editingCommentId = ref(null)

  const confirmDialog = ref(false)
  const confirmTitle = ref('')
  const confirmText = ref('')
  const currentUser = computed(() => authStore.user)

  let confirmAction = null

  function showConfirm(title, text, action) {
    confirmTitle.value = title
    confirmText.value = text
    confirmAction = action
    confirmDialog.value = true
  }

  function executeConfirmAction() {
    if (confirmAction) confirmAction()
    confirmDialog.value = false
  }

  async function loadPosts() {
    try {
      const res = await api.get('/posts/feed')
      const rawPosts = res.data.posts || res.data || []

      allPosts.value = normalizePosts(rawPosts)

      const tagsSet = new Set()
      allPosts.value.forEach(post => {
        post.tags?.forEach(tag => tagsSet.add(tag))
      })

      allTags.value = Array.from(tagsSet)
      currentPage.value = 1
      posts.value = allPosts.value.slice(0, pageSize)
    } catch (error) {
      console.error('Failed to load feed', error)
    }
  }

  function loadMorePosts() {
    const nextPage = currentPage.value + 1
    posts.value = allPosts.value.slice(0, nextPage * pageSize)
    currentPage.value = nextPage
  }

  async function loadComments(post) {
    try {
      const res = await api.get(`/posts/${post.id}/comments`)
      const comments = res.data.comments || []
      post.comments = comments.filter(comment => comment.status !== 'deleted')
    } catch (error) {
      console.error('Failed to load comments', error)
      post.comments = []
    }
  }

  async function toggleComments(postId) {
    const post = posts.value.find(item => item.id === postId)
    if (!post) return

    if (expandedPosts.value.includes(postId)) {
      expandedPosts.value = expandedPosts.value.filter(id => id !== postId)
      return
    }

    expandedPosts.value.push(postId)
    if (!post.comments || post.comments.length === 0) {
      await loadComments(post)
    }
  }

  function toggleTag(tag) {
    if (selectedTags.value.includes(tag)) {
      selectedTags.value = selectedTags.value.filter(item => item !== tag)
      return
    }

    selectedTags.value.push(tag)
  }

  function clearFilters() {
    selectedTags.value = []
  }

  const sortedPosts = computed(() => {
    const result = selectedTags.value.length === 0
      ? posts.value.slice()
      : posts.value.filter(post =>
          post.tags?.some(tag => selectedTags.value.includes(tag)),
        )

    if (sortType.value === 'latest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (sortType.value === 'mostComment') {
      result.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0))
    }

    return result
  })

  const topTags = computed(() => {
    const tagCounts = {}

    allPosts.value.forEach(post => {
      post.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag)
  })

  function isOwnComment(comment) {
    const commentUserId = comment.user_id ?? comment.user?.id
    return commentUserId === currentUser.value?.id
  }

  function isEditingComment(commentId) {
    return editingCommentId.value === commentId
  }

  function startEdit(comment) {
    editingCommentId.value = comment.id
    editContent.value[comment.id] = comment.content
  }

  function confirmStartEdit(comment) {
    showConfirm(
      'Редагувати коментар?',
      'Ви дійсно хочете редагувати цей коментар?',
      () => startEdit(comment),
    )
  }

  function cancelEdit(commentId) {
    editingCommentId.value = null
    editContent.value[commentId] = ''
  }

  async function saveEdit(comment) {
    try {
      const content = editContent.value[comment.id]
      if (!content || !content.trim()) return

      await api.put(`/posts/comments/${comment.id}`, { content })
      comment.content = content
      editingCommentId.value = null
      editContent.value[comment.id] = ''
    } catch (error) {
      console.error('Failed to edit comment', error)
    }
  }

  function confirmSaveEdit(comment) {
    showConfirm(
      'Зберегти зміни?',
      'Ви дійсно хочете зберегти зміни в коментарі?',
      () => saveEdit(comment),
    )
  }

  async function deleteComment(comment, post) {
    try {
      await api.delete(`/posts/comments/${comment.id}`)
      post.comments = post.comments.filter(item => item.id !== comment.id)
    } catch (error) {
      console.error('Failed to delete comment', error)
    }
  }

  function confirmDeleteComment(comment, post) {
    showConfirm(
      'Видалити коментар?',
      'Ви дійсно хочете видалити цей коментар?',
      () => deleteComment(comment, post),
    )
  }

  async function addComment(post) {
    const content = newComment.value[post.id]
    if (!content || !content.trim()) return

    try {
      const res = await api.post(`/posts/${post.id}/comments`, { content })
      const comment = res.data.comment

      const normalizedComment = {
        ...comment,
        user: {
          id: currentUser.value.id,
          name: currentUser.value.name,
          avatar: currentUser.value.avatar || null,
        },
      }

      if (!post.comments) post.comments = []
      post.comments.push(normalizedComment)
      newComment.value[post.id] = ''

      if (!expandedPosts.value.includes(post.id)) {
        expandedPosts.value.push(post.id)
      }
    } catch (error) {
      console.error('Failed to add comment', error)
    }
  }

  function confirmAddComment(post) {
    showConfirm(
      'Додати коментар?',
      'Ви дійсно хочете додати цей коментар?',
      () => addComment(post),
    )
  }

  function goToProfile(userId) {
    if (userId === currentUser.value?.id) {
      router.push('/ProfileMe')
      return
    }

    router.push({
      path: `/profile/${userId}`,
    })
  }

  onMounted(() => {
    loadPosts()
  })

  return {
    allPosts,
    allTags,
    cancelEdit,
    clearFilters,
    confirmAddComment,
    confirmDeleteComment,
    confirmDialog,
    confirmSaveEdit,
    confirmStartEdit,
    confirmText,
    confirmTitle,
    editContent,
    executeConfirmAction,
    expandedPosts,
    getAvatarUrl,
    goToProfile,
    isEditingComment,
    isOwnComment,
    loadMorePosts,
    newComment,
    posts,
    selectedTags,
    sortType,
    sortedPosts,
    toggleComments,
    toggleTag,
    topTags,
  }
}
