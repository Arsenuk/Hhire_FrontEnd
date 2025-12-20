<template>
  <v-container fluid class="feed-page">
    <v-row>
      <!-- Ліва колонка: Фільтри -->
      <v-col cols="12" md="2">
        <v-card>
          <v-card-title>Filters</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="filter in filters" :key="filter.id" @click="applyFilter(filter)">
                <v-list-item-title>{{ filter.label }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Центральна колонка: Пости -->
      <v-col cols="12" md="6">
        <v-card v-for="post in posts" :key="post.id" class="mb-4">
          <!-- Заголовок поста: аватар + title + тип -->
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="d-flex align-center gap-3">
              <v-avatar size="40">
                <v-img :src="getAvatarUrl(post.owner.avatar)" />
              </v-avatar>
              <span class="post-title">{{ post.title }}</span>
            </div>
            <span class="post-type">{{ post.owner.role }}</span>
          </v-card-title>

          <!-- Автор і дата -->
          <v-card-subtitle class="d-flex justify-space-between">
            <span>{{ post.owner.name }}</span>
            <span>{{ formatDate(post.created_at) }}</span>
          </v-card-subtitle>

          <!-- Контент -->
          <v-card-text>
            {{ post.content }}
          </v-card-text>

          <!-- Кнопка для коментарів -->
          <v-card-actions>
            <v-btn icon @click="toggleComments(post.id)">
              <v-icon>mdi-comment-outline</v-icon>
            </v-btn>
          </v-card-actions>

          <!-- Коментарі -->
          <v-expand-transition>
            <div v-if="expandedPosts.includes(post.id)" class="comments-section">
              <v-list dense>
                <v-list-item v-for="comment in post.comments || []" :key="comment.id">
                  <v-list-item-avatar>
                    <v-img :src="getAvatarUrl(comment.owner.avatar)" />
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>{{ comment.owner.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ comment.content }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item v-if="!(post.comments && post.comments.length)">
                  <v-list-item-title>No comments yet</v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
          </v-expand-transition>
        </v-card>

        <!-- Кнопка "Load More" -->
        <v-btn color="primary" class="mt-4" @click="loadMorePosts">Load More Posts</v-btn>
      </v-col>

      <!-- Права колонка: Запропоновані користувачі -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Suggested Users</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="suggested in suggestedUsers" :key="suggested.id">
                <v-list-item-avatar>
                  <v-img :src="getAvatarUrl(suggested.avatar)" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ suggested.name }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn small color="primary" @click="sendContactRequest(suggested.id)">Connect</v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api/api.js'

const posts = ref([])
const expandedPosts = ref([])
const filters = ref([
  { id: 1, label: 'All' },
  { id: 2, label: 'News' },
  { id: 3, label: 'Jobs' },
  { id: 4, label: 'Companies' },
])
const suggestedUsers = ref([])

const getAvatarUrl = (avatar) => avatar ? `http://localhost:3000${avatar}` : '/default-avatar.png'

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString()
}

// Завантаження постів
async function loadPosts() {
  try {
    const res = await api.get('/posts')
    const postsFromBackend = res.data.posts || []

    // Прив'язка owner (user чи company)
    posts.value = postsFromBackend.map(post => {
      if (post.company_id) {
        return {
          ...post,
          owner: {
            id: post.company_id,
            name: post.company_name || 'Company',
            role: 'company',
            avatar: post.company_avatar || null
          }
        }
      } else {
        return {
          ...post,
          owner: {
            id: post.user_id,
            name: post.user_name || 'User',
            role: 'user',
            avatar: post.user_avatar || null
          }
        }
      }
    })
  } catch (err) {
    console.error('Failed to load posts', err)
  }
}

function toggleComments(postId) {
  if (expandedPosts.value.includes(postId)) {
    expandedPosts.value = expandedPosts.value.filter(id => id !== postId)
  } else {
    expandedPosts.value.push(postId)
  }
}

function applyFilter(filter) {
  console.log('Filter applied:', filter.label)
  // TODO: реалізувати фільтрування по темі
}

async function loadSuggestedUsers() {
  try {
    // тимчасово тестовий масив
    suggestedUsers.value = [
      { id: 1, name: 'Alice', avatar: null },
      { id: 2, name: 'Bob', avatar: null },
    ]
    // const res = await api.get('/users/suggested')
    // suggestedUsers.value = res.data || []
  } catch (err) {
    console.error('Failed to load suggested users', err)
  }
}

async function loadMorePosts() {
  console.log('Load more posts clicked')
  // TODO: пагінація
}

async function sendContactRequest(userId) {
  console.log('Send contact request to user', userId)
  // TODO: реальний запит на бекенд
}

onMounted(() => {
  loadPosts()
  loadSuggestedUsers()
})
</script>

<style scoped>
.feed-page {
  margin-top: 80px;
}

.post-title {
  font-weight: 600;
  font-size: 16px;
}

.post-type {
  font-size: 12px;
  color: #666;
}

.comments-section {
  padding: 10px 16px;
  background-color: #f9f9f9;
}
</style>
