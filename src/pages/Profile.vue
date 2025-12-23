<template>
  <v-container fluid class="profile-page">
    <template v-if="user">
      <!-- Верхній блок: аватар + ім'я + кнопка Edit Profile -->
      <v-row class="profile-header mb-6" align="center" justify="space-between">
        <v-col cols="12" md="2" class="text-center">
          <v-avatar size="120" class="avatar-border">
            <v-img :src="getAvatarUrl(user.avatar)" lazy-src="./assets/defaultAvatar" :alt="user.name || 'Avatar'" />
          </v-avatar>
        </v-col>

        <v-col cols="12" md="8" class="profile-name-col">
          <h1>{{ user.name || "User didn't provide information" }}</h1>
        </v-col>

        <v-col cols="12" md="2" class="text-center text-md-right">
          <v-btn class="edit-btn" @click="editing = true">Edit Profile</v-btn>
        </v-col>
      </v-row>

      <!-- Форма редагування профілю -->
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
            <v-spacer></v-spacer>
            <v-btn text @click="cancelEdit">Cancel</v-btn>
            <v-btn color="primary" @click="saveProfile">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Середній блок: Description та Useful Links -->
      <v-row class="mb-6">
        <v-col cols="12" md="8">
          <v-card class="profile-card">
            <v-card-title>Description</v-card-title>
            <v-card-text>
              {{ user.description || "User didn't provide information" }}
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Useful Links з кнопками редагування та видалення -->
        <v-col cols="12" md="4">
          <v-card class="profile-card">
            <v-card-title class="d-flex justify-space-between align-center">
              Useful Links
              <v-btn size="small" icon="mdi-plus" @click="openAddLink" />
            </v-card-title>

            <v-card-text>
              <v-list dense>
                <v-list-item
                  v-for="link in links"
                  :key="link.id"
                  class="d-flex justify-space-between"
                >
                  <v-list-item-title>
                    <a :href="link.url" target="_blank" rel="noopener noreferrer">
                      {{ link.description || link.url }}
                    </a>
                  </v-list-item-title>

                  <template #append>
                    <v-btn icon="mdi-pencil" size="x-small" @click="openEditLink(link)" />
                    <v-btn icon="mdi-delete" size="x-small" @click="deleteLink(link.id)" />
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
      <v-dialog v-model="showLinkDialog" max-width="500">
        <v-card>
          <v-card-title>
            {{ editingLink ? 'Edit Link' : 'Add Link' }}
          </v-card-title>

          <v-card-text>
            <v-text-field
              label="URL"
              v-model="linkForm.url"
              required
            />
            <v-text-field
              label="Description"
              v-model="linkForm.description"
            />
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn text @click="closeLinkDialog">Cancel</v-btn>
            <v-btn color="primary" @click="saveLink">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Нижній блок: Posts -->
      <v-row>
        <v-col cols="12">
          <v-card class="profile-card">
            <v-card-title>Posts</v-card-title>
            <v-card-text>
              <v-list dense>
                <v-list-item v-for="post in posts" :key="post.id">
                  <v-list-item-title>{{ post.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ post.content }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="posts.length === 0">
                  <v-list-item-title>User didn't provide information</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Loader -->
    <v-row v-else justify="center" align="center" class="fill-height">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="50"></v-progress-circular>
      </v-col>
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

// onMounted: завантаження даних
onMounted(() => {
  authStore.loadUserFromStorage()
  loadProfile()
})
</script>



<style scoped>
/* ===================== Загальний контейнер ===================== */
.profile-page {
  margin-top: 60px;
  padding: 0 16px;
  padding-top: clamp(70px, 10vh, 100px);
  font-family: 'Junge', serif;
  color: #000;
}

/* ===================== Аватар ===================== */
.avatar-border {
  border: 2px solid #97e5ee;
  padding: 2px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.v-avatar img {
  object-fit: cover;
}

/* ===================== Ім'я користувача ===================== */
.profile-name-col h1 {
  font-weight: 700;
  font-size: clamp(20px, 2.5vw, 28px);
  margin: 0;
}

/* ===================== Кнопки ===================== */
.edit-btn,
.logout-btn {
  background: linear-gradient(90deg, #D3FFAD 11%, #97e5ee 100%);
  color: #000;
  font-weight: 500;
  text-transform: none;
  min-width: 120px;
  transition: all 0.2s ease-in-out;
}

.edit-btn:hover,
.logout-btn:hover {
  opacity: 0.85;
}

/* ===================== Картки ===================== */
.profile-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  padding: 16px;
}

/* ===================== Списки ===================== */
v-list-item a {
  color: #00796b;
  text-decoration: none;
}

v-list-item a:hover {
  text-decoration: underline;
}

/* Кнопки у списках */
.v-list-item .v-btn {
  margin-left: 4px;
}

/* ===================== Діалоги ===================== */
.v-dialog .v-card {
  border-radius: 12px;
}

.v-dialog .v-card-title {
  font-weight: 600;
  font-size: 18px;
}

.v-dialog .v-btn {
  min-width: 80px;
}

/* ===================== Мобільна адаптивність ===================== */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .profile-name-col {
    text-align: center;
  }

  .logout-btn {
    width: 100%;
  }
}

/* ===================== Секція Useful Links ===================== */
.profile-card .v-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-card .v-list-item-title a {
  word-break: break-all;
  font-weight: 500;
}

/* ===================== Додаткові дрібні стилі ===================== */
.v-text-field,
.v-textarea,
.v-file-input {
  margin-bottom: 12px;
}

.v-card-actions {
  justify-content: flex-end;
}
</style>

