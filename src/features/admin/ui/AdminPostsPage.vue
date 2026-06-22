<template>
  <main class="admin-posts">
    <section class="admin-posts__shell">
      <div class="admin-posts__header">
        <div>
          <p class="admin-posts__eyebrow">Administration</p>
          <h1>Posts</h1>
          <p class="admin-posts__subtitle">
            Review reported posts and anything that is not currently active before it returns to the public feed.
          </p>
        </div>

        <div class="admin-posts__header-actions">
          <v-btn prepend-icon="mdi-arrow-left" variant="text" @click="router.push('/AdminPanel')">
            Back to panel
          </v-btn>

          <v-btn class="gradient-primary-btn" prepend-icon="mdi-refresh" :loading="loading" @click="fetchPosts">
            Refresh
          </v-btn>
        </div>
      </div>

      <v-card class="admin-posts__filters" flat>
        <div class="admin-posts__filters-row">
          <v-text-field
            v-model="searchQuery"
            class="admin-posts__search"
            clearable
            hide-details
            label="Search by title or content"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            @keyup.enter="fetchPosts"
          />

          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            hide-details
            item-title="label"
            item-value="value"
            label="Status"
            variant="outlined"
          />

          <v-btn class="gradient-primary-btn" :loading="loading" @click="fetchPosts">
            Search
          </v-btn>
        </div>
      </v-card>

      <v-card class="admin-posts__table-card" flat>
        <div v-if="loading" class="admin-posts__state">
          <v-progress-circular color="primary" indeterminate />
          <p>Loading posts...</p>
        </div>

        <div v-else-if="filteredPosts.length === 0" class="admin-posts__state">
          <v-icon icon="mdi-file-search-outline" size="36" />
          <p>No flagged or non-active posts found for the current filters.</p>
        </div>

        <div v-else class="admin-posts__table-wrap">
          <v-table class="admin-posts__table">
            <thead>
              <tr>
                <th>Post</th>
                <th>Intent</th>
                <th>Report tags</th>
                <th>Status</th>
                <th>Conversations</th>
                <th>Created</th>
                <th class="admin-posts__actions-head">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(post, index) in filteredPosts" :key="post.id ?? `admin-post-${index}`">
                <td>
                  <div class="admin-posts__post-cell">
                    <div class="admin-posts__post">
                      <div class="admin-posts__post-title">
                        {{ post.title || 'Untitled post' }}
                      </div>
                      <div class="admin-posts__post-preview">
                        {{ postPreview(post.content) }}
                      </div>
                    </div>

                    <v-btn
                      class="admin-posts__view-full-btn"
                      size="small"
                      variant="text"
                      prepend-icon="mdi-open-in-new"
                      @click="openFullPost(post)"
                    >
                      View full
                    </v-btn>
                  </div>
                </td>

                <td>
                  <v-chip size="small" variant="outlined">
                    {{ post.intent || 'n/a' }}
                  </v-chip>
                </td>

                <td>
                  <div v-if="post.report_tags?.length" class="admin-posts__tags">
                    <v-chip
                      v-for="tag in post.report_tags"
                      :key="`${post.id}:${tag}`"
                      size="x-small"
                      variant="outlined"
                    >
                      {{ tag }}
                    </v-chip>
                  </div>
                  <span v-else class="admin-posts__empty-value">-</span>
                </td>

                <td>
                  <div class="admin-posts__status-cell">
                    <v-chip
                      :color="getStatusColor(post.status)"
                      size="small"
                      variant="tonal"
                    >
                      {{ post.status || 'unknown' }}
                    </v-chip>

                    <span class="admin-posts__status-count">
                      {{ formatCount(post.report_count) }} reports
                    </span>
                  </div>
                </td>

                <td>
                  <div class="admin-posts__metric">
                    {{ formatCount(post.conversation_count) }}
                  </div>
                </td>

                <td>{{ formatDate(post.created_at) }}</td>

                <td class="admin-posts__actions">
                  <v-btn
                    v-for="action in getActionButtons(post)"
                    :key="`${post.id}:${action.key}`"
                    :color="action.color"
                    size="small"
                    :variant="action.variant"
                    :loading="actionLoadingKey === `${post.id}:${action.key}`"
                    @click="openConfirmation(post, action)"
                  >
                    {{ action.label }}
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card>
    </section>
  </main>

  <v-dialog v-model="confirmDialog" max-width="480">
    <v-card class="admin-posts__dialog">
      <v-card-title class="admin-posts__dialog-title">
        {{ pendingAction?.label || 'Confirm action' }}
      </v-card-title>

      <v-card-text class="admin-posts__dialog-text">
        <p v-if="selectedPost">
          You are about to <strong>{{ pendingAction?.label.toLowerCase() }}</strong>
          <strong>{{ selectedPost.title || 'this post' }}</strong>.
        </p>
        <p>
          {{ pendingAction?.description }}
        </p>
      </v-card-text>

      <v-card-actions class="admin-posts__dialog-actions">
        <v-btn variant="text" @click="closeConfirmation">
          Cancel
        </v-btn>

        <v-btn
          :color="pendingAction?.color"
          :class="!pendingAction?.color ? 'gradient-primary-btn' : ''"
          :loading="Boolean(actionLoadingKey)"
          @click="submitAction"
        >
          {{ pendingAction?.confirmLabel || 'Confirm' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="fullPostDialog" max-width="920" scrollable>
    <v-card class="admin-posts__full-post-dialog">
      <v-card-title class="admin-posts__full-post-dialog-title">
        <div class="admin-posts__full-post-heading">
          <div>
            <p class="admin-posts__full-post-eyebrow">Reported post</p>
            <h2>{{ fullPostSource?.title || 'Untitled post' }}</h2>
          </div>

          <div class="admin-posts__full-post-badges">
            <v-chip
              :color="getStatusColor(fullPostSource?.status)"
              size="small"
              variant="tonal"
            >
              {{ fullPostSource?.status || 'unknown' }}
            </v-chip>

            <v-chip size="small" variant="outlined">
              {{ formatCount(fullPostSource?.report_count) }} reports
            </v-chip>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="admin-posts__full-post-body">
        <div class="admin-posts__full-post-meta">
          <div class="admin-posts__full-post-meta-item">
            <span class="admin-posts__full-post-meta-label">Post ID</span>
            <span class="admin-posts__full-post-meta-value">#{{ fullPostSource?.id ?? '-' }}</span>
          </div>

          <div class="admin-posts__full-post-meta-item">
            <span class="admin-posts__full-post-meta-label">Author ID</span>
            <span class="admin-posts__full-post-meta-value">#{{ fullPostSource?.user_id ?? '-' }}</span>
          </div>

          <div class="admin-posts__full-post-meta-item">
            <span class="admin-posts__full-post-meta-label">Created</span>
            <span class="admin-posts__full-post-meta-value">{{ formatDate(fullPostSource?.created_at) }}</span>
          </div>

          <div class="admin-posts__full-post-meta-item">
            <span class="admin-posts__full-post-meta-label">Intent</span>
            <span class="admin-posts__full-post-meta-value">{{ fullPostSource?.intent || 'n/a' }}</span>
          </div>
        </div>

        <div v-if="fullPostSource?.report_tags?.length" class="admin-posts__full-post-tags">
          <div class="admin-posts__full-post-section-label">Report tags</div>
          <div class="admin-post__tags-list">
            <v-chip
              v-for="tag in fullPostSource.report_tags"
              :key="`full-post-${fullPostSource.id}:${tag}`"
              size="small"
              variant="outlined"
            >
              {{ tag }}
            </v-chip>
          </div>
        </div>

        <PostCard
          v-if="fullPostCard"
          class="admin-posts__feed-card"
          :avatar-size="40"
          :hoverable="false"
          :owner-clickable="false"
          :post="fullPostCard"
          :show-owner-role="true"
          :show-report-button="false"
          title-placement="header"
          variant="feed"
        />
      </v-card-text>

      <v-card-actions class="admin-posts__full-post-actions">
        <v-btn variant="text" @click="closeFullPost">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    location="bottom"
    multi-line
    rounded="pill"
    timeout="2500"
  >
    {{ snackbar.text }}
  </v-snackbar>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import PostCard from '@/entities/post/ui/PostCard.vue'
  import { normalizePost } from '@/entities/post/lib/normalizePost'
  import { api } from '@/shared/api/api'
  import { useSnackbar } from '@/shared/lib/composables/useSnackbar'
  import type { EntityId, Post } from '@/shared/types'

  type PostStatus = 'active' | 'hidden' | 'deleted' | string
  type AdminPost = {
    id: EntityId
    title?: string | null
    content?: string | null
    intent?: string | null
    user_id?: EntityId | null
    company_id?: EntityId | null
    owner?: Post['owner']
    tags?: Post['tags'] | Array<{ id?: EntityId | null, name?: string | null } | string | null>
    images?: Array<string> | null
    conversation_count?: number | string | null
    report_count?: number | string | null
    report_tags?: string[] | null
    status?: PostStatus
    created_at?: string | null
  }

  type PostActionType = 'hide' | 'restore' | 'delete'

  type PostActionButton = {
    key: string
    label: string
    color: string
    variant: 'text' | 'flat' | 'elevated' | 'outlined' | 'plain' | 'tonal'
    type: PostActionType
    confirmLabel: string
    description: string
  }

  const router = useRouter()
  const { showToast, snackbar } = useSnackbar()

  const posts = ref<AdminPost[]>([])
  const loading = ref(false)
  const searchQuery = ref('')
  const statusFilter = ref('all')
  const confirmDialog = ref(false)
  const selectedPost = ref<AdminPost | null>(null)
  const fullPostDialog = ref(false)
  const fullPostSource = ref<AdminPost | null>(null)
  const pendingAction = ref<PostActionButton | null>(null)
  const actionLoadingKey = ref('')

  const statusOptions = [
    { label: 'All statuses', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Hidden', value: 'hidden' },
    { label: 'Deleted', value: 'deleted' },
  ]

  const filteredPosts = computed(() => {
    if (statusFilter.value === 'all') {
      return posts.value
    }

    return posts.value.filter(post => post.status === statusFilter.value)
  })

  const actionButtons: Record<string, PostActionButton[]> = {
    active: [
      {
        key: 'hide',
        label: 'Hide',
        color: 'warning',
        variant: 'tonal',
        type: 'hide',
        confirmLabel: 'Confirm hide',
        description: 'The post will be removed from the public feed and marked as hidden.',
      },
      {
        key: 'delete',
        label: 'Delete',
        color: 'error',
        variant: 'tonal',
        type: 'delete',
        confirmLabel: 'Confirm delete',
        description: 'The post will be permanently marked as deleted in moderation.',
      },
    ],
    hidden: [
      {
        key: 'restore',
        label: 'Restore',
        color: 'success',
        variant: 'tonal',
        type: 'restore',
        confirmLabel: 'Confirm restore',
        description: 'The post will be returned to the active feed and become visible again.',
      },
      {
        key: 'delete',
        label: 'Delete',
        color: 'error',
        variant: 'tonal',
        type: 'delete',
        confirmLabel: 'Confirm delete',
        description: 'This hidden post will be marked as deleted and kept out of the public feed.',
      },
    ],
  }

  const fullPostCard = computed<Post | null>(() => {
    if (!fullPostSource.value) {
      return null
    }

    return normalizePost(fullPostSource.value)
  })

  function postPreview(value: string | null | undefined) {
    if (!value) {
      return 'No content preview available.'
    }

    const trimmed = value.trim()
    return trimmed.length > 120 ? `${trimmed.slice(0, 120)}...` : trimmed
  }

  function formatCount(value: number | string | null | undefined) {
    if (value == null || value === '') {
      return '0'
    }

    const numericValue = typeof value === 'string' ? Number(value) : value

    return Number.isFinite(numericValue) ? String(numericValue) : String(value)
  }

  function getNextStatus(action: PostActionType) {
    switch (action) {
      case 'hide':
        return 'hidden'
      case 'restore':
        return 'active'
      case 'delete':
        return 'deleted'
      default:
        return 'active'
    }
  }

  function formatDate(value: string | null | undefined) {
    if (!value) {
      return '-'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return new Intl.DateTimeFormat('en', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  function getStatusColor(status: PostStatus | null | undefined) {
    switch (status) {
      case 'active':
        return 'success'
      case 'hidden':
        return 'warning'
      case 'deleted':
        return 'error'
      default:
        return 'default'
    }
  }

  function getActionButtons(post: AdminPost) {
    return actionButtons[post.status || ''] || actionButtons.active
  }

  function openConfirmation(post: AdminPost, action: PostActionButton) {
    selectedPost.value = post
    pendingAction.value = action
    confirmDialog.value = true
  }

  function openFullPost(post: AdminPost) {
    fullPostSource.value = post
    fullPostDialog.value = true
  }

  function closeFullPost() {
    fullPostDialog.value = false
    fullPostSource.value = null
  }

  function closeConfirmation({ force = false } = {}) {
    if (actionLoadingKey.value && !force) {
      return
    }

    confirmDialog.value = false
    selectedPost.value = null
    pendingAction.value = null
  }

  async function fetchPosts() {
    loading.value = true

    try {
      const params: Record<string, string> = {}

      if (searchQuery.value.trim()) {
        params.q = searchQuery.value.trim()
      }

      if (statusFilter.value !== 'all') {
        params.status = statusFilter.value
      }

      const response = await api.get<AdminPost[]>('/admin/posts', { params })
      posts.value = Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Failed to load admin posts', error)
      showToast('Failed to load posts', 'error')
    } finally {
      loading.value = false
    }
  }

  async function submitAction() {
    if (!selectedPost.value || !pendingAction.value) {
      return
    }

    const postId = selectedPost.value.id
    const action = pendingAction.value
    actionLoadingKey.value = `${postId}:${action.key}`

    try {
      await api.post(`/admin/posts/${postId}/${action.type}`)

      const nextStatus = getNextStatus(action.type)
      posts.value = posts.value.map(post => (
        post.id === postId
          ? { ...post, status: nextStatus }
          : post
      ))

      showToast(
        action.type === 'hide'
          ? 'Post has been hidden'
          : action.type === 'restore'
            ? 'Post has been restored'
            : 'Post has been deleted',
        'success',
      )
      closeConfirmation({ force: true })
    } catch (error) {
      console.error(`Failed to ${action.type} post`, error)
      showToast(
        action.type === 'hide'
          ? 'Failed to hide post'
          : action.type === 'restore'
            ? 'Failed to restore post'
            : 'Failed to delete post',
        'error',
      )
    } finally {
      actionLoadingKey.value = ''
    }
  }

  onMounted(fetchPosts)
</script>

<style scoped>
.admin-posts {
  min-height: calc(100vh - 84px);
  background: #f7faf9;
  padding: 118px 20px 48px;
}

.admin-posts__shell {
  margin: 0 auto;
  max-width: 1240px;
}

.admin-posts__header {
  align-items: flex-start;
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 24px;
}

.admin-posts__eyebrow {
  color: #51756f;
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 6px;
  text-transform: uppercase;
}

.admin-posts h1 {
  color: #10201d;
  font-family: 'Junge', serif;
  font-size: 40px;
  font-weight: 400;
  line-height: 1.1;
  margin: 0;
}

.admin-posts__subtitle {
  color: #52615e;
  font-size: 16px;
  margin: 10px 0 0;
  max-width: 620px;
}

.admin-posts__header-actions {
  display: flex;
  gap: 12px;
}

.admin-posts__filters,
.admin-posts__table-card {
  border: 1px solid #dce8e5;
  border-radius: 16px;
}

.admin-posts__filters {
  margin-bottom: 18px;
  padding: 18px;
}

.admin-posts__filters-row {
  align-items: center;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1.8fr) minmax(180px, 0.7fr) auto;
}

.admin-posts__search {
  min-width: 0;
}

.admin-posts__table-wrap {
  overflow-x: auto;
}

.admin-posts__table :deep(th) {
  color: #45625d;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.admin-posts__table :deep(td) {
  padding: 18px 16px;
  vertical-align: middle;
}

.admin-posts__post-cell {
  align-items: flex-start;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.admin-posts__post {
  min-width: 0;
}

.admin-posts__post-title {
  color: #172522;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
}

.admin-posts__post-preview {
  color: #60716e;
  font-size: 13px;
  line-height: 1.5;
  margin-top: 4px;
}

.admin-posts__view-full-btn {
  flex-shrink: 0;
  margin-top: -2px;
}

.admin-posts__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.admin-posts__empty-value {
  color: #94a3b8;
  font-size: 13px;
}

.admin-posts__status-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.admin-posts__status-count {
  color: #60716e;
  font-size: 12px;
  font-weight: 600;
}

.admin-posts__metric {
  color: #172522;
  font-size: 15px;
  font-weight: 700;
}

.admin-posts__actions,
.admin-posts__actions-head {
  text-align: right;
}

.admin-posts__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.admin-posts__state {
  align-items: center;
  color: #60716e;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  min-height: 280px;
  padding: 24px;
  text-align: center;
}

.admin-posts__dialog {
  border-radius: 18px;
}

.admin-posts__dialog-title {
  color: #172522;
  font-size: 18px;
  font-weight: 700;
  padding: 18px 20px 0;
}

.admin-posts__dialog-text {
  color: #52615e;
  font-size: 14px;
  line-height: 1.6;
  padding: 16px 20px 8px;
}

.admin-posts__dialog-actions {
  justify-content: flex-end;
  padding: 12px 20px 20px;
}

.admin-posts__full-post-dialog {
  border-radius: 20px;
}

.admin-posts__full-post-dialog-title {
  padding: 20px 20px 0;
}

.admin-posts__full-post-heading {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.admin-posts__full-post-eyebrow,
.admin-posts__full-post-section-label,
.admin-posts__full-post-meta-label {
  color: #5a726d;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin: 0;
  text-transform: uppercase;
}

.admin-posts__full-post-heading h2 {
  color: #172522;
  font-family: 'Junge', serif;
  font-size: 28px;
  font-weight: 400;
  line-height: 1.2;
  margin: 4px 0 0;
}

.admin-posts__full-post-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.admin-posts__full-post-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px 20px 8px;
}

.admin-posts__feed-card {
  width: 100%;
}

.admin-posts__full-post-meta {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.admin-posts__full-post-meta-item {
  background: #f8fbfa;
  border: 1px solid #dce8e5;
  border-radius: 14px;
  padding: 12px;
}

.admin-posts__full-post-meta-value {
  color: #172522;
  display: block;
  font-weight: 700;
  margin-top: 4px;
}

.admin-posts__full-post-content-card {
  background: #fbfefd;
  border: 1px solid #dce8e5;
  border-radius: 18px;
  padding: 18px;
}

.admin-posts__full-post-title {
  color: #172522;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
  margin-bottom: 12px;
}

.admin-posts__full-post-content {
  color: #41524e;
  font-size: 15px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.admin-posts__full-post-empty {
  color: #7b8e89;
  font-size: 14px;
}

.admin-posts__full-post-tags {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.admin-post__tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.admin-posts__full-post-actions {
  justify-content: flex-end;
  padding: 0 20px 20px;
}

.gradient-primary-btn {
  background: linear-gradient(90deg, #c3f894 0%, #4edeee 100%) !important;
  color: #020617 !important;
  font-weight: 600;
  text-transform: none;
}

.gradient-primary-btn:hover {
  background: linear-gradient(90deg, #c3f894 0%, #4edeee 100%) !important;
  color: #020617 !important;
}

@media (max-width: 860px) {
  .admin-posts__header {
    flex-direction: column;
  }

  .admin-posts__header-actions {
    flex-wrap: wrap;
  }

  .admin-posts__filters-row {
    grid-template-columns: 1fr;
  }

  .admin-posts__post-cell {
    align-items: flex-start;
    flex-direction: column;
  }

  .admin-posts__actions {
    flex-wrap: wrap;
  }

  .admin-posts__full-post-meta {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .admin-posts {
    padding: 158px 14px 36px;
  }

  .admin-posts h1 {
    font-size: 32px;
  }

  .admin-posts__full-post-meta {
    grid-template-columns: 1fr;
  }

  .admin-posts__full-post-heading h2 {
    font-size: 24px;
  }
}
</style>
