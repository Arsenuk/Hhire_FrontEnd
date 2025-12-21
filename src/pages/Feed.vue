<template>
  <v-container fluid class="feed-page">
    <v-row>

      <!-- ================= LEFT: FILTERS ================= -->
      <v-col cols="12" md="2">
        <v-card class="filter-card">
          <v-card-title>Filters</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="filter in filters" :key="filter.id" @click="applyFilter(filter)" style="cursor: pointer">
                <v-list-item-title>{{ filter.label }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- ================= CENTER: POSTS ================= -->
      <v-col cols="12" md="6">

        <v-card v-for="post in posts" :key="post.id" class="post-card mb-4">
          <!-- HEADER -->
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="d-flex align-center gap-3">
              <v-avatar size="40">
                <v-img :src="getAvatarUrl(post.owner.avatar)" lazy-src="./assets/default-avatar.png" />
              </v-avatar>
              <span class="post-title">{{ post.title }}</span>
            </div>

            <span class="post-type">
              {{ post.owner.role }}
            </span>
          </v-card-title>

          <!-- SUBTITLE -->
          <v-card-subtitle class="d-flex justify-space-between">
            <span>{{ post.owner.name }}</span>
            <span>{{ formatDate(post.created_at) }}</span>
          </v-card-subtitle>

          <!-- CONTENT + TAGS -->
          <v-card-text>
            {{ post.content }}

            <!-- Теги -->
            <div v-if="post.tags && post.tags.length" class="post-tags mt-2">
              <v-chip
                v-for="(tag, index) in post.tags"
                :key="index"
                small
                color="primary"
                class="ma-1"
                outlined
              >
                {{ tag }}
              </v-chip>
            </div>
          </v-card-text>

          <!-- ACTIONS -->
          <v-card-actions>
            <v-btn icon @click="toggleComments(post.id)">
              <v-icon>mdi-comment-outline</v-icon>
            </v-btn>
          </v-card-actions>

          <!-- COMMENTS -->
          <v-expand-transition>
            <div v-if="expandedPosts.includes(post.id)" class="comments-section">
              <v-list dense>
                <v-list-item v-for="comment in post.comments || []" :key="comment.id">
                  <v-avatar size="36">
                    <v-img :src="getAvatarUrl(comment.user.avatar)" lazy-src="./assets/default-avatar.png" />
                  </v-avatar>

                  <div class="ml-3">
                    <div class="comment-name">
                      {{ comment.user.name }}
                    </div>
                    <div class="comment-content">
                      {{ comment.content }}
                    </div>
                  </div>
                </v-list-item>

                <v-list-item v-if="!post.comments || post.comments.length === 0">
                  <v-list-item-title>
                    No comments yet
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
          </v-expand-transition>
        </v-card>

        <!-- LOAD MORE -->
        <v-btn v-if="posts.length < allPosts.length" class="load-more-btn mt-4" @click="loadMorePosts">
          Load More Posts
        </v-btn>

      </v-col>

      <!-- ================= RIGHT: SUGGESTED ================= -->
      <v-col cols="12" md="4">
        <v-card class="suggested-card">
          <v-card-title>Suggested Users</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="suggested in suggestedUsers" :key="suggested.id">
                <v-avatar size="36">
                  <v-img :src="getAvatarUrl(suggested.avatar)" lazy-src="./assets/default-avatar.png" />
                </v-avatar>

                <v-list-item-title class="ml-3">
                  {{ suggested.name }}
                </v-list-item-title>

                <v-list-item-action>
                  <v-btn small color="primary" @click="sendContactRequest(suggested.id)">
                    Connect
                  </v-btn>
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

/* ================= STATE ================= */
const allPosts = ref([])
const posts = ref([])
const expandedPosts = ref([])

const pageSize = 6
const currentPage = ref(1)

const filters = ref([
    { id: 1, label: 'All' },
    { id: 2, label: 'News' },
    { id: 3, label: 'Jobs' },
    { id: 4, label: 'Companies' }
])

const suggestedUsers = ref([])

/* ================= HELPERS ================= */
const getAvatarUrl = (avatar) =>
    avatar ? `http://localhost:3000${avatar}` : './assets/default-avatar.png'

const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString()

function resolveUserName(post) {
    return (
        post.user_name ||
        post.username ||
        post.name ||
        post.company_name ||
        'Unknown'
    )
}

function resolveAvatar(post) {
    return (
        post.user_avatar ||
        post.avatar ||
        post.company_avatar ||
        null
    )
}

/* ================= API ================= */
async function loadPosts() {
    try {
        const res = await api.get('/posts/feed')
        const rawPosts = res.data.posts || res.data || []

        allPosts.value = rawPosts.map(post => {
            const owner = post.owner || {}

            return {
                ...post,
                owner: {
                    id: owner.id || (post.company_id || post.user_id),
                    name: owner.name || resolveUserName(post),
                    role: owner.role || (post.company_id ? 'company' : 'user'),
                    avatar: owner.avatar || resolveAvatar(post)
                }
            }
        })

        currentPage.value = 1
        posts.value = allPosts.value.slice(0, pageSize)
    } catch (err) {
        console.error('Failed to load feed', err)
    }
}


function loadMorePosts() {
    const nextPage = currentPage.value + 1
    posts.value = allPosts.value.slice(0, nextPage * pageSize)
    currentPage.value = nextPage
}

function toggleComments(postId) {
    expandedPosts.value = expandedPosts.value.includes(postId)
        ? expandedPosts.value.filter(id => id !== postId)
        : [...expandedPosts.value, postId]
}

function applyFilter(filter) {
    console.log('Filter:', filter.label)
}

/* ================= MOCK ================= */
async function loadSuggestedUsers() {
    suggestedUsers.value = [
        { id: 1, name: 'Alice', avatar: null },
        { id: 2, name: 'Bob', avatar: null }
    ]
}

function sendContactRequest(userId) {
    console.log('Send request to', userId)
}

/* ================= INIT ================= */
onMounted(() => {
    loadPosts()
    loadSuggestedUsers()
})
</script>

<style
    scoped>
    .feed-page {
        margin-top: 60px;
        background-color: #f7f9fc;
        min-height: 100vh;
        padding-top: 40px;
        font-family: 'Junge', serif;
    }

    /* ===== LEFT: Filters ===== */
    .filter-card {
        border-radius: 16px;
        padding: 8px;
    }

    .filter-card .v-card-title {
        font-weight: 700;
        font-size: 18px;
    }

    .filter-card .v-list-item {
        border-radius: 10px;
        margin-bottom: 4px;
        transition: background 0.2s;
    }

    .filter-card .v-list-item:hover {
        background: rgba(151, 229, 238, 0.2);
    }

    /* ===== CENTER: Post card ===== */
    .post-card {
        border-radius: 18px;
        padding-bottom: 4px;
    }

    .post-card .v-card-title {
        font-weight: 600;
        font-size: 16px;
    }

    .post-title {
        font-weight: 600;
        font-size: 16px;
    }

    .post-type {
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 999px;
        background: linear-gradient(90deg, #d3ffad 11%, #97e5ee 100%);
        color: #000;
    }

    /* subtitle */
    .post-card .v-card-subtitle {
        font-size: 13px;
        color: #666;
    }

    /* content */
    .post-card .v-card-text {
        font-size: 15px;
        line-height: 1.5;
    }

    /* actions */
    .post-card .v-btn {
        color: #555;
    }

    .post-card .v-btn:hover {
        color: #000;
    }

    /* ===== COMMENTS ===== */
    .comments-section {
        padding: 12px 16px;
        background-color: #f9f9f9;
        border-top: 1px solid #eee;
    }

    .comment-name {
        font-weight: 600;
        font-size: 14px;
    }

    .comment-content {
        font-size: 14px;
        color: #333;
    }

    /* ===== RIGHT: Suggested users ===== */
    .suggested-card {
        border-radius: 16px;
    }

    .suggested-card .v-card-title {
        font-weight: 700;
    }

    .suggested-card .v-list-item {
        border-radius: 12px;
        margin-bottom: 6px;
    }

    .suggested-card .v-btn {
        background: linear-gradient(90deg, #d3ffad 11%, #97e5ee 100%);
        color: #000;
        text-transform: none;
        font-weight: 600;
    }

    /* ===== LOAD MORE ===== */
    .load-more-btn {
        width: 100%;
        border-radius: 14px;
        height: 48px;
        background: linear-gradient(90deg, #d3ffad 11%, #97e5ee 100%);
        color: #000;
        font-weight: 600;
        text-transform: none;
    }
</style>
