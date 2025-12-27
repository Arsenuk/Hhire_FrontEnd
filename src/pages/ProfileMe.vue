<template>
  <v-container fluid class="profile-page">

    <!-- ================= STATUS ================= -->
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
          {{ errorMessage }}
        </v-alert>

        <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
          {{ successMessage }}
        </v-alert>
      </v-col>
    </v-row>

    <template v-if="user">

      <!-- ================= HEADER ================= -->
      <v-row class="profile-header mb-8" align="center">
        <v-col cols="12" md="2" class="text-center">
          <v-avatar size="120" class="avatar-border">
            <v-img :src="getAvatarUrl(user.avatar)" />
          </v-avatar>
        </v-col>

        <v-col cols="12" md="7">
          <h1 class="profile-name">
            {{ user.name || "User didn't provide information" }}
          </h1>
        </v-col>

        <v-col cols="12" md="3" class="text-md-right text-center">
          <v-btn class="edit-btn" @click="editing = true">
            Edit Profile
          </v-btn>
        </v-col>
      </v-row>

      <!-- ================= PROFILE INFO ================= -->
      <v-row class="mb-8">
        <v-col cols="12" md="8">
          <v-card class="profile-card">
            <v-card-title>Description</v-card-title>
            <v-card-text>
              {{ user.description || "User didn't provide information" }}
            </v-card-text>
          </v-card>
        </v-col>

        <!-- ================= LINKS ================= -->
        <v-col cols="12" md="4">
          <v-card class="profile-card">
            <v-card-title class="d-flex justify-space-between align-center">
              Useful Links
              <v-btn icon="mdi-plus" size="small" @click="openAddLink" />
            </v-card-title>

            <v-card-text>
              <v-list density="compact">
                <v-list-item v-for="link in links" :key="link.id">
                  <v-list-item-title>
                    <a :href="link.url" target="_blank">
                      {{ link.description || link.url }}
                    </a>
                  </v-list-item-title>

                  <template #append>
                    <v-btn icon size="x-small" @click="openEditLink(link)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon size="x-small" @click="openDeleteLink(link.id)">
                      <v-icon color="red">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>

                <v-list-item v-if="links.length === 0">
                  <v-list-item-title>
                    User didn't provide information
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ================= POSTS ================= -->
      <v-row>
        <v-col cols="12">
          <v-card class="profile-card">
            <v-card-title>Posts</v-card-title>

            <v-card-text>
              <v-row>
                <v-col v-for="post in posts" :key="post.id" cols="12" md="6">
                  <v-card class="post-card">

                    <!-- POST HEADER -->
                    <v-card-title class="post-header">
                      <div class="post-user">
                        <v-avatar size="36">
                          <v-img :src="getAvatarUrl(post.owner?.avatar)" />
                        </v-avatar>

                        <div>
                          <div class="post-username">
                            {{ post.owner?.name || 'Unknown user' }}
                          </div>
                          <div class="post-meta">
                            {{ formatDate(post.created_at) }}
                          </div>
                        </div>
                      </div>

                      <div v-if="isOwnPost(post)" class="post-actions">
                        <v-btn icon size="x-small" @click="startEditPost(post)">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon size="x-small" @click="openDeletePost(post)">
                          <v-icon color="red">mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </v-card-title>

                    <!-- POST BODY -->
                    <v-card-text>
                      <h4 class="mb-2">{{ post.title }}</h4>
                      <p>{{ post.content }}</p>

                      <div v-if="post.tags?.length" class="post-tags mt-3">
                        <v-chip v-for="tag in post.tags" :key="tag" size="small" variant="outlined" class="ma-1">
                          #{{ tag }}
                        </v-chip>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col v-if="posts.length === 0" cols="12">
                  <p>User didn't provide posts</p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

    </template>

    <!-- ================= LOADER ================= -->
    <v-row v-else justify="center" class="mt-10">
      <v-progress-circular indeterminate size="50" />
    </v-row>

    <!-- ================= EDIT PROFILE DIALOG ================= -->
    <v-dialog v-model="editing" max-width="600">
      <v-card>
        <v-card-title>Edit Profile</v-card-title>

        <v-card-text>
          <v-form ref="formRef">
            <v-text-field v-model="editForm.name" label="Name" :rules="nameRules" />
            <v-textarea v-model="editForm.description" label="Description" />
            <v-file-input v-model="editForm.avatarFile" label="Avatar" accept="image/*" />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cancelEdit">Cancel</v-btn>
          <v-btn color="primary" :loading="loading" @click="saveProfile">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ================= LINK DIALOG ================= -->
    <v-dialog v-model="showLinkDialog" max-width="500">
      <v-card>
        <v-card-title>{{ editingLink ? 'Edit Link' : 'Add Link' }}</v-card-title>

        <v-card-text>
          <v-form ref="linkFormRef">
            <v-text-field label="URL" v-model="linkForm.url" :rules="urlRules" />
            <v-text-field label="Description" v-model="linkForm.description" />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showLinkDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="loading" @click="saveLink">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ================= EDIT POST DIALOG ================= -->
    <v-dialog v-model="editingPostDialog" max-width="600">
      <v-card>
        <v-card-title>Edit Post</v-card-title>

        <v-card-text>
          <v-form ref="postFormRef">
            <v-text-field v-model="editPostForm.title" label="Title" :rules="postRules.title" />
            <v-textarea v-model="editPostForm.content" label="Content" :rules="postRules.content" />
            <v-combobox v-model="editPostForm.tags" label="Tags" multiple chips clearable hide-selected />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cancelEditPost">Cancel</v-btn>
          <v-btn color="primary" :loading="loading" @click="savePost">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ================= DELETE LINK CONFIRM ================= -->
    <v-dialog v-model="showDeleteLinkDialog" max-width="420">
      <v-card class="confirm-card">
        <v-card-title class="confirm-title">
          Delete link
        </v-card-title>

        <v-card-text class="confirm-text">
          Are you sure you want to delete this link?
          <br />
          This action cannot be undone.
        </v-card-text>

        <v-card-actions class="confirm-actions">
          <v-spacer />
          <v-btn variant="text" class="confirm-cancel" @click="showDeleteLinkDialog = false">
            Cancel
          </v-btn>
          <v-btn class="confirm-delete" :loading="loading" @click="deleteConfirmedLink">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ================= DELETE POST CONFIRM ================= -->
    <v-dialog v-model="showDeletePostDialog" max-width="420">
      <v-card class="confirm-card">
        <v-card-title class="confirm-title">
          Delete Post
        </v-card-title>

        <v-card-text class="confirm-text">
          Are you sure you want to delete this post?
          <br />
          This action cannot be undone.
        </v-card-text>

        <v-card-actions class="confirm-actions">
          <v-spacer />
          <v-btn variant="text" class="confirm-cancel" @click="showDeletePostDialog = false">
            Cancel
          </v-btn>
          <v-btn class="confirm-delete" :loading="loading" @click="deleteConfirmedPost">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { api } from '@/api/api.js'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

// ================= COMMON UI STATE =================
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// ================= PROFILE =================
const editing = ref(false)
const formRef = ref(null)

const editForm = ref({
  name: '',
  description: '',
  avatarFile: null
})

const nameRules = [
  v => !!v || 'Name is required',
  v => v.length >= 2 || 'Minimum 2 characters'
]

// ================= LINKS =================
const links = ref([])
const showLinkDialog = ref(false)
const linkFormRef = ref(null)
const editingLink = ref(null)

const showDeleteLinkDialog = ref(false)
const linkToDelete = ref(null)

const linkForm = ref({
  url: '',
  description: ''
})

const urlRules = [
  v => !!v || 'URL is required',
  v => /^https?:\/\//.test(v) || 'URL must start with http(s)'
]

// ================= POSTS =================
const posts = ref([])
const editingPostDialog = ref(false)
const postFormRef = ref(null)

const showDeletePostDialog = ref(false)
const postToDelete = ref(null)


const editPostForm = ref({
  id: null,
  title: '',
  content: '',
  tags: []
})

const postRules = {
  title: [v => !!v || 'Title is required'],
  content: [v => !!v || 'Content is required']
}

// ================= AVATAR =================
const defaultAvatar = './assets/default-avatar.png'
const getAvatarUrl = (avatar) => {
  if (!avatar) return defaultAvatar
  return avatar.startsWith('http') ? avatar : `http://localhost:3000${avatar}`
}

// ================= LOAD PROFILE =================
async function loadProfile() {
  loading.value = true
  errorMessage.value = ''

  try {
    const [profileRes, linksRes, postsRes] = await Promise.all([
      api.get('/users/profile'),
      api.get('/user-links'),
      api.get('/posts')
    ])

    authStore.user = profileRes.data
    links.value = linksRes.data
    posts.value = postsRes.data.posts

    editForm.value.name = profileRes.data.name
    editForm.value.description = profileRes.data.description
  } catch (e) {
    errorMessage.value = 'Failed to load profile'
  } finally {
    loading.value = false
  }
}

// ================= PROFILE SAVE =================
async function saveProfile() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  errorMessage.value = ''

  try {
    await api.put('/users/profile', {
      name: editForm.value.name,
      description: editForm.value.description
    })

    if (editForm.value.avatarFile) {
      const fd = new FormData()
      fd.append('avatar', editForm.value.avatarFile)
      await api.post('/users/me/avatar', fd)
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

// ================= LINKS =================
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

// Підтвердження видалення з діалогу
async function deleteConfirmedLink() {
  if (!linkToDelete.value) return

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await api.delete(`/user-links/${linkToDelete.value}`)
    links.value = links.value.filter(l => l.id !== linkToDelete.value)
    successMessage.value = 'Link deleted successfully'
  } catch {
    errorMessage.value = 'Failed to delete link'
  } finally {
    loading.value = false
    showDeleteLinkDialog.value = false
    linkToDelete.value = null
  }
}

// ================= POSTS =================
function isOwnPost(post) {
  return post.user_id === user.value?.id
}

function startEditPost(post) {
  editingPostDialog.value = true
  editPostForm.value = {
    id: post.id,
    title: post.title,
    content: post.content,
    tags: [...(post.tags || [])]
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
      tags: editPostForm.value.tags
    })

    const index = posts.value.findIndex(p => p.id === editPostForm.value.id)
    if (index !== -1) {
      posts.value[index] = {
        ...posts.value[index],
        title: editPostForm.value.title,
        content: editPostForm.value.content,
        tags: [...editPostForm.value.tags]
      }
    }

    editingPostDialog.value = false
    successMessage.value = 'Post updated'
  } catch (err) {
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
    posts.value = posts.value.filter(p => p.id !== postToDelete.value.id)
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

// ================= UTILS =================
function formatDate(d) {
  return new Date(d).toLocaleString()
}

onMounted(() => {
  authStore.loadUserFromStorage()
  loadProfile()
})
</script>





<style scoped>
/* ================= PAGE ================= */
.profile-page {
  /* background: #0f172a; */
  background-color: #f9f9f9;
  min-height: 100vh;
  padding: clamp(80px, 10vh, 120px) 16px 16px;
  color: #e5e7eb;
}

/* ================= HEADER ================= */
.profile-header {
  background: linear-gradient(135deg, #baf2b3, #7b91f2cc);
  border-radius: 18px;
  padding: 24px;
}

.avatar-border {
  border: 3px solid #14b8a6;
}

.profile-name-col h1 {
  font-size: 28px;
  font-weight: 700;
}

/* ================= BUTTON ================= */
.edit-btn {
  background: #14b8a6;
  color: #020617;
  font-weight: 600;
  border-radius: 12px;
}

/* ================= CARDS ================= */
.profile-card {
  /* background: #020617; */
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
}

/* ================= LINKS ================= */
a {
  color: #5eead4;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* ================= POSTS ================= */
.post-card {
  /* background: #020617; */
  border-radius: 18px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.55);
}

/* ===== POST HEADER ===== */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
}

.post-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.post-user-info {
  display: flex;
  flex-direction: column;
}

.post-username {
  font-weight: 600;
  font-size: 15px;
}

.post-meta {
  font-size: 12px;
  color: #94a3b8;
}

.post-actions {
  display: flex;
  gap: 6px;
}

/* ===== POST BODY ===== */
.post-card h4 {
  font-size: 18px;
  font-weight: 600;
}

.post-card p {
  font-size: 14px;
  color: #cbd5f5;
  line-height: 1.6;
}

/* ================= TAGS ================= */
.post-tags {
  margin-top: 12px;
}

.post-tags .v-chip {
  background: rgba(20, 184, 166, 0.12);
  border-color: #14b8a6;
  color: #5eead4;
  font-weight: 500;
}

/* ================= LIST ================= */
.v-list-item {
  border-radius: 12px;
  transition: background 0.2s ease;
}

.v-list-item:hover {
  background: rgba(20, 184, 166, 0.08);
}

/* ================= EMPTY STATE ================= */
.v-card-text {
  color: #94a3b8;
}

/* ================= RESPONSIVE ================= */
@media (max-width: 960px) {
  .profile-header {
    text-align: center;
  }

  .profile-name-col {
    margin-top: 12px;
  }

  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .post-actions {
    align-self: flex-end;
  }
}

/* ================= CONFIRM DELETE ================= */
.confirm-card {
  border-radius: 18px;
  background: #ffffff;
}

.confirm-title {
  font-weight: 700;
  font-size: 18px;
  color: #020617;
}

.confirm-text {
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
}

.confirm-actions {
  padding: 12px 16px 16px;
}

/* Cancel */
.confirm-cancel {
  color: #64748b;
  font-weight: 500;
}

/* Delete */
.confirm-delete {
  background: #ef4444;
  color: #fff;
  font-weight: 600;
  border-radius: 12px;
  padding: 6px 18px;
}

.confirm-delete:hover {
  background: #dc2626;
}
</style>
