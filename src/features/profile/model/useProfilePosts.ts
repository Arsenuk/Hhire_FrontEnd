import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { normalizePosts } from '@/entities/post/lib/normalizePost'
import type { EditablePostForm, ProfilePostView, ValidatableForm } from '@/features/profile/model/contracts'
import { api } from '@/shared/api/api'
import type { EntityId, Post, User } from '@/shared/types'

interface UseProfilePostsOptions {
  user: ComputedRef<User | null>
  loading: Ref<boolean>
  errorMessage: Ref<string>
  successMessage: Ref<string>
}

const intentOptions = [
  { label: 'General', value: 'general' },
  { label: 'Job', value: 'job' },
  { label: 'Mentorship', value: 'mentorship' },
  { label: 'Partnership', value: 'partnership' },
  { label: 'Hire', value: 'hire' },
  { label: 'Offer', value: 'offer' },
]

export function useProfilePosts ({ user, loading, errorMessage, successMessage }: UseProfilePostsOptions) {
  const posts = ref<ProfilePostView[]>([])
  const editingPostDialog = ref(false)
  const postFormRef = ref<ValidatableForm | null>(null)

  const showDeletePostDialog = ref(false)
  const postToDelete = ref<ProfilePostView | null>(null)

  const editPostForm = ref<EditablePostForm>({
    id: null,
    title: '',
    content: '',
    intent: 'general',
    tags: [],
    imageFiles: [],
    removeImages: false,
  })

  const postRules = {
    title: [(value: string) => !!value || 'Title is required'],
    content: [(value: string) => !!value || 'Content is required'],
    tags: [(value: string[]) => Boolean(value?.length) || 'Add at least one tag'],
  }

  function setPosts (nextPosts: Post[] = []) {
    posts.value = normalizePosts(nextPosts)
  }

  const userId = computed(() => user.value?.id)

  function isOwnPost (post: ProfilePostView) {
    return post.user_id === userId.value
  }

  function startEditPost (post: ProfilePostView) {
    editingPostDialog.value = true
    editPostForm.value = {
      id: post.id ?? null,
      title: post.title || '',
      content: post.content || '',
      intent: post.intent || 'general',
      tags: [...(post.tags || [])],
      imageFiles: [],
      removeImages: false,
    }
  }

  function cancelEditPost () {
    editingPostDialog.value = false
  }

  async function savePost () {
    const { valid } = await postFormRef.value?.validate() ?? { valid: false }
    if (!valid) {
      return
    }

    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
      const formData = new FormData()
      const imageFiles = Array.isArray(editPostForm.value.imageFiles)
        ? editPostForm.value.imageFiles
        : []

      formData.append('title', editPostForm.value.title)
      formData.append('content', editPostForm.value.content)
      formData.append('intent', editPostForm.value.intent)
      formData.append('removeImages', editPostForm.value.removeImages ? 'true' : 'false')

      const tags = editPostForm.value.tags || []

      for (const tag of tags) {
        formData.append('tags', tag)
      }

      for (const file of imageFiles) {
        formData.append('images', file)
      }

      const { data } = await api.put<{ post?: Partial<ProfilePostView> }>(`/posts/${editPostForm.value.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const index = posts.value.findIndex(post => post.id === editPostForm.value.id)
      if (index !== -1) {
        const currentPost = posts.value[index]
        if (!currentPost) {
          return
        }

        const updatedPost = data?.post || {}
        const [normalizedPost] = normalizePosts([{
          ...currentPost,
          ...updatedPost,
          owner: currentPost.owner,
          tags: updatedPost.tags ?? currentPost.tags,
        }])

        if (normalizedPost) {
          posts.value[index] = normalizedPost
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

  function openDeletePost (post: ProfilePostView) {
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
      posts.value = posts.value.filter(post => post.id !== postToDelete.value?.id)
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
    intentOptions,
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
