import { computed, onMounted, ref } from 'vue'
import { api } from '@/api/api.js'
import { useAuthStore } from '@/stores/auth.js'
import { getAvatarUrl, normalizePosts } from '@/utils/postDisplay.js'

export function useProfileMe() {
  const authStore = useAuthStore()
  const user = computed(() => authStore.user)

  const loading = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  const editing = ref(false)
  const formRef = ref(null)

  const editForm = ref({
    name: '',
    description: '',
    avatarFile: null,
  })

  const nameRules = [
    value => !!value || 'Name is required',
    value => value.length >= 2 || 'Minimum 2 characters',
  ]

  const links = ref([])
  const showLinkDialog = ref(false)
  const linkFormRef = ref(null)
  const editingLink = ref(null)

  const showDeleteLinkDialog = ref(false)
  const linkToDelete = ref(null)

  const linkForm = ref({
    url: '',
    description: '',
  })

  const urlRules = [
    value => !!value || 'URL is required',
    value => /^https?:\/\//.test(value) || 'URL must start with http(s)',
  ]

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

  async function loadProfile() {
    loading.value = true
    errorMessage.value = ''

    try {
      const [profileRes, linksRes, postsRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/user-links'),
        api.get('/posts'),
      ])

      authStore.user = profileRes.data
      links.value = linksRes.data
      posts.value = normalizePosts(postsRes.data.posts || [])

      editForm.value.name = profileRes.data.name
      editForm.value.description = profileRes.data.description
    } catch {
      errorMessage.value = 'Failed to load profile'
    } finally {
      loading.value = false
    }
  }

  async function saveProfile() {
    const { valid } = await formRef.value.validate()
    if (!valid) return

    loading.value = true
    errorMessage.value = ''

    try {
      await api.put('/users/profile', {
        name: editForm.value.name,
        description: editForm.value.description,
      })

      if (editForm.value.avatarFile) {
        const formData = new FormData()
        formData.append('avatar', editForm.value.avatarFile)
        await api.post('/users/me/avatar', formData)
      }

      editing.value = false
      successMessage.value = 'Profile updated successfully'
      await loadProfile()
    } catch {
      errorMessage.value = 'Failed to update profile'
    } finally {
      loading.value = false
    }
  }

  function cancelEdit() {
    editing.value = false
  }

  function openAddLink() {
    editingLink.value = null
    linkForm.value = { url: '', description: '' }
    showLinkDialog.value = true
  }

  function openEditLink(link) {
    editingLink.value = link
    linkForm.value = { url: link.url, description: link.description }
    showLinkDialog.value = true
  }

  async function saveLink() {
    const { valid } = await linkFormRef.value.validate()
    if (!valid) return

    loading.value = true
    errorMessage.value = ''

    try {
      if (editingLink.value) {
        await api.put(`/user-links/${editingLink.value.id}`, linkForm.value)
      } else {
        await api.post('/user-links', linkForm.value)
      }

      const res = await api.get('/user-links')
      links.value = res.data
      showLinkDialog.value = false
    } catch {
      errorMessage.value = 'Failed to save link'
    } finally {
      loading.value = false
    }
  }

  function openDeleteLink(id) {
    linkToDelete.value = id
    showDeleteLinkDialog.value = true
  }

  async function deleteConfirmedLink() {
    if (!linkToDelete.value) return

    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
      await api.delete(`/user-links/${linkToDelete.value}`)
      links.value = links.value.filter(link => link.id !== linkToDelete.value)
      successMessage.value = 'Link deleted successfully'
    } catch {
      errorMessage.value = 'Failed to delete link'
    } finally {
      loading.value = false
      showDeleteLinkDialog.value = false
      linkToDelete.value = null
    }
  }

  function isOwnPost(post) {
    return post.user_id === user.value?.id
  }

  function startEditPost(post) {
    editingPostDialog.value = true
    editPostForm.value = {
      id: post.id,
      title: post.title,
      content: post.content,
      tags: [...(post.tags || [])],
    }
  }

  function cancelEditPost() {
    editingPostDialog.value = false
  }

  async function savePost() {
    const { valid } = await postFormRef.value.validate()
    if (!valid) return

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

  async function deleteConfirmedPost() {
    if (!postToDelete.value) return

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

  function openDeletePost(post) {
    postToDelete.value = post
    showDeletePostDialog.value = true
  }

  onMounted(() => {
    authStore.loadUserFromStorage()
    loadProfile()
  })

  return {
    cancelEdit,
    cancelEditPost,
    deleteConfirmedLink,
    deleteConfirmedPost,
    editForm,
    editing,
    editingLink,
    editingPostDialog,
    editPostForm,
    errorMessage,
    formRef,
    getAvatarUrl,
    isOwnPost,
    linkForm,
    linkFormRef,
    links,
    loading,
    nameRules,
    openAddLink,
    openDeleteLink,
    openDeletePost,
    openEditLink,
    postFormRef,
    postRules,
    posts,
    saveLink,
    savePost,
    saveProfile,
    showDeleteLinkDialog,
    showDeletePostDialog,
    showLinkDialog,
    startEditPost,
    successMessage,
    urlRules,
    user,
  }
}
