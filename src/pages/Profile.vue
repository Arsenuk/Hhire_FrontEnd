<template>
  <v-container fluid class="profile-page">
    <template v-if="user">

      <!-- ================= HEADER ================= -->
      <v-row class="profile-header mb-6" align="center" justify="space-between">
        <v-col cols="12" md="2" class="text-center">
          <v-avatar size="120" class="avatar-border">
            <v-img :src="getAvatarUrl(user.avatar)" :alt="user.name || 'Avatar'" />
          </v-avatar>
        </v-col>

        <v-col cols="12" md="8" class="profile-name-col">
          <h1>{{ user.name || "User didn't provide information" }}</h1>
        </v-col>

        <v-col cols="12" md="2" class="text-center text-md-right">
          <v-btn class="edit-btn" @click="editing = true">
            Edit Profile
          </v-btn>
        </v-col>
      </v-row>

      <!-- Діалог редагування профілю -->
      <v-dialog v-model="editing" persistent max-width="600px">
        <v-card>
          <v-card-title>Edit Profile</v-card-title>
          <v-card-text>
            <v-form ref="form" @submit.prevent="saveProfile">
              <v-text-field v-model="editForm.name" label="Name" :rules="[v => !!v || 'Name is required']" />
              <v-textarea v-model="editForm.description" label="Description" />
              <v-file-input label="Change Avatar" accept="image/*" v-model="editForm.avatarFile" />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="cancelEdit">Cancel</v-btn>
            <v-btn color="primary" @click="saveProfile">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ================= DESCRIPTION + LINKS ================= -->
      <v-row class="mb-6">
        <v-col cols="12" md="8">
          <v-card class="profile-card">
            <v-card-title>Description</v-card-title>
            <v-card-text>
              {{ user.description || "User didn't provide information" }}
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="profile-card">
            <v-card-title class="d-flex justify-space-between align-center">
              Useful Links
              <v-btn size="small" icon="mdi-plus" @click="openAddLink" />
            </v-card-title>

            <v-card-text>
              <v-list dense>
                <v-list-item v-for="link in links" :key="link.id" class="d-flex justify-space-between">
                  <v-list-item-title>
                    <a :href="link.url" target="_blank">
                      {{ link.description || link.url }}
                    </a>
                  </v-list-item-title>

                  <template #append>
                    <v-btn icon small @click="openEditLink(link)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon small @click="deleteLink(link.id)">
                      <v-icon color="red">mdi-delete</v-icon>
                    </v-btn>
                  </template>

                </v-list-item>

                <v-list-item v-if="links.length === 0">
                  <v-list-item-title>User didn't provide information</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Діалог додавання / редагування лінку -->
      <v-dialog v-model="showLinkDialog" persistent max-width="500px">
        <v-card>
          <v-card-title>
            {{ editingLink ? 'Edit Link' : 'Add Link' }}
          </v-card-title>

          <v-card-text>
            <v-form ref="linkFormRef" @submit.prevent="saveLink">
              <v-text-field label="URL" v-model="linkForm.url" required />
              <v-text-field label="Description" v-model="linkForm.description" />
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn text @click="closeLinkDialog">Cancel</v-btn>
            <v-btn color="primary" @click="saveLink">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ================= POSTS ================= -->
      <v-row>
        <v-col cols="12">
          <v-card class="profile-card">
            <v-card-title>Posts</v-card-title>

            <v-card-text>
              <v-row>
                <v-col v-for="post in posts" :key="post.id" cols="12" md="6">
                  <v-card class="post-card mb-4">

                    <!-- ===== POST HEADER (avatar + name) ===== -->
                    <v-card-title class="post-header">
                      <div class="post-user">
                        <v-avatar size="36">
                          <v-img :src="getAvatarUrl(post.owner?.avatar)" />
                        </v-avatar>

                        <div class="post-user-info">
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
                        <v-btn icon size="x-small" @click="confirmDeletePost(post)">
                          <v-icon color="red">mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </v-card-title>

                    <!-- ===== POST BODY ===== -->
                    <v-card-text>
                      <h4 class="mb-2">{{ post.title }}</h4>
                      <p>{{ post.content }}</p>

                      <!-- TAGS -->
                      <div class="post-tags" v-if="post.tags?.length">
                        <v-chip v-for="tag in post.tags" :key="tag" size="small" variant="outlined" color="teal"
                          class="ma-1">
                          #{{ tag }}
                        </v-chip>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col v-if="posts.length === 0" cols="12">
                  <v-card-text>User didn't provide posts</v-card-text>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Діалог додавання/редагування лінку -->
      <v-dialog v-model="editingPostDialog" persistent max-width="600px">
        <v-card>
          <v-card-title>Edit Post</v-card-title>
          <v-card-text>
            <v-form ref="postForm" @submit.prevent="savePost">
              <v-text-field v-model="editPostForm.title" label="Title" required />
              <v-textarea v-model="editPostForm.content" label="Content" required />
              <v-combobox v-model="editPostForm.tags" label="Tags" multiple small-chips deletable-chips hide-selected
                clearable />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="cancelEditPost">Cancel</v-btn>
            <v-btn color="primary" @click="savePost">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </template>

    <!-- ================= LOADER ================= -->
    <v-row v-else justify="center" align="center" class="fill-height">
      <v-progress-circular indeterminate color="primary" size="50" />
    </v-row>
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

// Основні дані
const links = ref([])
const posts = ref([])

// Редагування профілю
const editing = ref(false)
const editForm = ref({
  name: '',
  description: '',
  avatarFile: null
})
const defaultAvatar = './assets/default-avatar.png'

const getAvatarUrl = (avatar) => {
  if (!avatar) return defaultAvatar
  return avatar.startsWith('http') ? avatar : `http://localhost:3000${avatar}`
}

// CRUD User Links
const editingLink = ref(null) // null або обʼєкт лінку
const linkForm = ref({
  url: '',
  description: ''
})

const showLinkDialog = ref(false)

// Завантаження профілю, лінків і постів
async function loadProfile() {
  try {
    const [profileRes, linksRes, postsRes] = await Promise.all([
      api.get('/users/profile'),
      api.get('/user-links'),
      api.get('/posts')
    ])
    authStore.user = profileRes.data
    links.value = linksRes.data
    posts.value = postsRes.data.posts

    // Заповнюємо форму редагування профілю
    editForm.value.name = profileRes.data.name
    editForm.value.description = profileRes.data.description
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.error || err.message || 'Failed to load profile')
  }
}

// Профіль: редагування та збереження
function cancelEdit() {
  editing.value = false
}

async function saveProfile() {
  try {
    // Оновлення name та description
    await api.put('/users/profile', {
      name: editForm.value.name,
      description: editForm.value.description
    })

    // Якщо обрано аватар, окремий POST
    if (editForm.value.avatarFile) {
      const avatarData = new FormData()
      avatarData.append('avatar', editForm.value.avatarFile)
      await api.post('/users/me/avatar', avatarData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }

    editing.value = false
    await loadProfile()
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.error || err.message || 'Failed to update profile')
  }
}

// User Links: методи
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
  try {
    if (!linkForm.value.url) {
      alert('URL is required')
      return
    }

    if (editingLink.value) {
      // Update
      await api.put(`/user-links/${editingLink.value.id}`, linkForm.value)
    } else {
      // Create
      await api.post('/user-links', linkForm.value)
    }

    // Оновлюємо список лінків
    const res = await api.get('/user-links')
    links.value = res.data
    closeLinkDialog()
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.error || err.message || 'Failed to save link')
  }
}

async function deleteLink(id) {
  if (!confirm('Delete this link?')) return
  try {
    await api.delete(`/user-links/${id}`)
    links.value = links.value.filter(l => l.id !== id)
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.error || err.message || 'Failed to delete link')
  }
}

function closeLinkDialog() {
  showLinkDialog.value = false
}

// Posts edit
const editingPostDialog = ref(false)
const editPostForm = ref({ id: null, title: '', content: '', tags: [] })

function isOwnPost(post) {
  return post.user_id === user.value?.id
}


function startEditPost(post) {
  editingPostDialog.value = true
  editPostForm.value = {
    id: post.id,
    title: post.title,
    content: post.content,
    tags: [...post.tags] // <-- string[]
  }
}


function cancelEditPost() {
  editingPostDialog.value = false
  editPostForm.value = { id: null, title: '', content: '' }
}

async function savePost() {
  try {
    const { id, title, content, tags } = editPostForm.value
    await api.put(`/posts/${id}`, { title, content })

    const index = posts.value.findIndex(p => p.id === id)
    if (index !== -1) {
      posts.value[index].title = title
      posts.value[index].content = content
      posts.value[index].tags = tags.map(name => ({ id: name, name })) // адаптувати під апі
    }

    cancelEditPost()
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.error || 'Failed to save post')
  }
}

async function confirmDeletePost(post) {
  if (!confirm('Delete this post?')) return
  try {
    await api.delete(`/posts/${post.id}`)
    posts.value = posts.value.filter(p => p.id !== post.id)
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.error || 'Failed to delete post')
  }
}

// Допоміжна функція для форматування дати
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString()
}

// onMounted: завантаження даних
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
</style>
