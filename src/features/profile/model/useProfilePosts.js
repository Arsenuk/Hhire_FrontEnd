import { computed, ref } from 'vue'
import { normalizePosts } from '@/entities/post/lib/normalizePost.js'
import { api } from '@/shared/api/api.js'

export function useProfilePosts ({ user, loading, errorMessage, successMessage }) {
  const posts = ref([])
  const editingPostDialog = ref(false)
  const postFormRef = ref(null)

  const showDeletePostDialog = ref(false)
  const postToDelete = ref(null)

  const editPostForm = ref({
    id: null,
    title: '',
    content: '',
    tags: [],
  })

  const postRules = {
    title: [value => !!value || 'Title is required'],
    content: [value => !!value || 'Content is required'],
  }

  function setPosts (nextPosts = []) {
    posts.value = normalizePosts(nextPosts)
  }

  const userId = computed(() => user.value?.id)

  function isOwnPost (post) {
    return post.user_id === userId.value
  }

  function startEditPost (post) {
    editingPostDialog.value = true
    editPostForm.value = {
      id: post.id,
      title: post.title,
      content: post.content,
      tags: [...(post.tags || [])],
    }
  }

  function cancelEditPost () {
    editingPostDialog.value = false
  }

  async function savePost () {
    const { valid } = await postFormRef.value.validate()
    if (!valid) {
      return
    }

    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
      await api.put(`/posts/${editPostForm.value.id}`, {
        title: editPostForm.value.title,
        content: editPostForm.value.content,
        tags: editPostForm.value.tags,
      })

      const index = posts.value.findIndex(post => post.id === editPostForm.value.id)
      if (index !== -1) {
        posts.value[index] = {
          ...posts.value[index],
          title: editPostForm.value.title,
          content: editPostForm.value.content,
          tags: [...editPostForm.value.tags],
        }
      }

      editingPostDialog.value = false
      successMessage.value = 'Post updated'
    } catch {
      errorMessage.value = 'Failed to update post'
    } finally {
      loading.value = false
    }
  }

  function openDeletePost (post) {
    postToDelete.value = post
    showDeletePostDialog.value = true
  }

  async function deleteConfirmedPost () {
    if (!postToDelete.value) {
      return
    }

    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
      await api.delete(`/posts/${postToDelete.value.id}`)
      posts.value = posts.value.filter(post => post.id !== postToDelete.value.id)
      successMessage.value = 'Post deleted'
      showDeletePostDialog.value = false
      postToDelete.value = null
    } catch {
      errorMessage.value = 'Failed to delete post'
    } finally {
      loading.value = false
    }
  }

  return {
    cancelEditPost,
    deleteConfirmedPost,
    editingPostDialog,
    editPostForm,
    isOwnPost,
    openDeletePost,
    postFormRef,
    postRules,
    posts,
    savePost,
    setPosts,
    showDeletePostDialog,
    startEditPost,
  }
}
