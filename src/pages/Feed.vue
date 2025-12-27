<template>
    <v-container fluid class="feed-page">
        <v-row>
            <!-- ================= LEFT: FILTERS ================= -->
            <v-col cols="12" md="2">
                <v-card class="filter-card">
                    <v-card-title>Filters</v-card-title>
                    <v-card-text>
                        <v-row dense>
                            <v-list-item v-for="tag in allTags" :key="tag" dense class="filter-list-item"
                                @click="toggleTag(tag)">
                                <v-chip :class="{ 'filter-chip-selected': selectedTags.includes(tag) }"
                                    class="filter-chip" outlined small>
                                    {{ tag }}
                                </v-chip>
                            </v-list-item>
                        </v-row>

                        <v-btn small class="mt-4 clear-btn" @click="clearFilters">
                            Clear
                        </v-btn>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- ================= CENTER: POSTS ================= -->
            <v-col cols="12" md="6">

                <!-- SORT BUTTONS -->
                <div class="d-flex gap-3 mb-3">
                    <v-btn :class="{ 'active-sort-btn': sortType === 'latest' }" small @click="sortType = 'latest'">
                        Latest
                    </v-btn>
                    <v-btn :class="{ 'active-sort-btn': sortType === 'mostComment' }" small
                        @click="sortType = 'mostComment'">
                        Most Comment
                    </v-btn>
                </div>

                <!-- POSTS -->
                <v-card v-for="post in sortedPosts" :key="post.id" class="post-card mb-4">
                    <!-- HEADER -->
                    <v-card-title class="d-flex justify-space-between align-center">
                        <div class="d-flex align-center gap-3">
                            <v-avatar size="40" class="clickable-avatar" @click="goToProfile(post.owner.id)">
                                <v-img :src="getAvatarUrl(post.owner.avatar)" lazy-src="./assets/default-avatar.png" />
                            </v-avatar>
                            <span class="post-title">{{ post.title }}</span>
                        </div>
                        <span class="post-type" :class="{ 'company-role': post.owner.role === 'company' }">
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
                        <div v-if="post.tags && post.tags.length" class="post-tags mt-2">
                            <v-chip v-for="(tag, index) in post.tags" :key="index" small color="primary" class="ma-1"
                                outlined>
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
                                <v-list-item v-for="comment in post.comments || []" :key="comment.id"
                                    class="comment-item">
                                    <v-avatar size="36" class="comment-avatar clickable-avatar"
                                        @click="goToProfile(comment.user.id)">
                                        <v-img :src="getAvatarUrl(comment.user.avatar)" />
                                    </v-avatar>

                                    <div class="ml-3 w-100 comment-bubble">
                                        <div class="comment-header">
                                            <span class="comment-name">{{ comment.user.name }}</span>

                                            <div v-if="isOwnComment(comment)" class="comment-actions">
                                                <v-btn icon size="x-small" @click="confirmStartEdit(comment)">
                                                    <v-icon size="16">mdi-pencil</v-icon>
                                                </v-btn>
                                                <v-btn icon size="x-small" @click="confirmDeleteComment(comment, post)">
                                                    <v-icon size="16" color="red">mdi-delete</v-icon>
                                                </v-btn>
                                            </div>
                                        </div>

                                        <div class="comment-text" v-if="!isEditingComment(comment.id)">
                                            {{ comment.content }}
                                        </div>

                                        <div v-else class="edit-actions">
                                            <v-text-field v-model="editContent[comment.id]" dense hide-details
                                                variant="outlined" class="comment-edit" />
                                            <v-btn small color="primary" class="mt-1"
                                                @click="confirmSaveEdit(comment, post)">
                                                Save
                                            </v-btn>
                                            <v-btn small color="secondary" class="mt-1" @click="cancelEdit(comment.id)">
                                                Cancel
                                            </v-btn>
                                        </div>
                                    </div>
                                </v-list-item>

                                <v-list-item v-if="!post.comments || post.comments.length === 0">
                                    <v-list-item-title>No comments yet</v-list-item-title>
                                </v-list-item>
                            </v-list>

                            <!-- Додавання нового коментаря -->
                            <v-text-field v-model="newComment[post.id]" label="Написати коментар..." dense outlined
                                clearable class="mt-2" @keyup.enter="confirmAddComment(post)" />
                            <v-btn small color="primary" class="mt-1" @click="confirmAddComment(post)">Post</v-btn>
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
                                <v-avatar size="36" class="clickable-avatar" @click="goToProfile(suggested.id)">
                                    <v-img :src="getAvatarUrl(suggested.avatar)"
                                        lazy-src="./assets/default-avatar.png" />
                                </v-avatar>

                                <v-list-item-title class="ml-3">{{ suggested.name }}</v-list-item-title>

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

        <!-- CONFIRM DIALOG -->
        <v-dialog v-model="confirmDialog" max-width="400">
            <v-card>
                <v-card-title>{{ confirmTitle }}</v-card-title>
                <v-card-text>{{ confirmText }}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="secondary" text @click="confirmDialog = false">Cancel</v-btn>
                    <v-btn color="primary" text @click="executeConfirmAction">Confirm</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </v-container>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/api/api.js'
import { useAuthStore } from '@/stores/auth.js'
import { useRouter } from 'vue-router'

const router = useRouter()

// --- POSTS ---
const allPosts = ref([])
const posts = ref([])
const expandedPosts = ref([])

const pageSize = 6
const currentPage = ref(1)

// --- SORT ---
const sortType = ref('latest') // latest або mostComment

// --- TAGS ---
const allTags = ref([])
const selectedTags = ref([])

// --- Suggested users ---
const suggestedUsers = ref([])

// --- COMMENTS ---
const newComment = ref({})
const editContent = ref({})
const editingCommentId = ref(null)

// --- AUTH ---
const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)

// --- UTILS ---
const getAvatarUrl = (avatar) => avatar ? `http://localhost:3000${avatar}` : './assets/default-avatar.png'
const formatDate = (dateStr) => new Date(dateStr).toLocaleString()

// --- CONFIRM DIALOG ---
const confirmDialog = ref(false)
const confirmTitle = ref('')
const confirmText = ref('')
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

// ================== LOAD POSTS ==================
async function loadPosts() {
    try {
        const res = await api.get('/posts/feed')
        const rawPosts = res.data.posts || res.data || []

        allPosts.value = rawPosts.map(post => {
            const owner = post.owner || {}

            return {
                ...post,
                tags: Array.isArray(post.tags)
                    ? post.tags.map(t => typeof t === 'string' ? t : t.name)
                    : [],

                comments: Array.isArray(post.comments)
                    ? post.comments.filter(c => c.status !== 'deleted')
                    : [],

                owner: {
                    id: owner.id ?? post.user_id ?? post.company_id ?? null,
                    name: owner.name ?? 'Unknown',
                    role: owner.role ?? (post.company_id ? 'company' : 'user'),
                    avatar: owner.avatar ?? null
                }
            }
        })


        const tagsSet = new Set()
        allPosts.value.forEach(p => p.tags?.forEach(t => tagsSet.add(t)))
        allTags.value = Array.from(tagsSet)

        currentPage.value = 1
        posts.value = allPosts.value.slice(0, pageSize)
    } catch (err) {
        console.error('Failed to load feed', err)
    }
}

// --- LOAD MORE POSTS ---
function loadMorePosts() {
    const nextPage = currentPage.value + 1
    posts.value = allPosts.value.slice(0, nextPage * pageSize)
    currentPage.value = nextPage
}

// --- LOAD COMMENTS ---
async function loadComments(post) {
    try {
        const res = await api.get(`/posts/${post.id}/comments`)
        const comments = res.data.comments || []
        post.comments = comments.filter(c => c.status !== 'deleted')
    } catch (err) {
        console.error('Failed to load comments', err)
        post.comments = []
    }
}

// --- TOGGLE COMMENTS ---
async function toggleComments(postId) {
    const post = posts.value.find(p => p.id === postId)
    if (!post) return

    if (expandedPosts.value.includes(postId)) {
        expandedPosts.value = expandedPosts.value.filter(id => id !== postId)
    } else {
        expandedPosts.value.push(postId)
        if (!post.comments || post.comments.length === 0) {
            await loadComments(post)
        }
    }
}

// --- FILTERS ---
const filteredPosts = computed(() => {
    if (selectedTags.value.length === 0) return posts.value
    return posts.value.filter(post => post.tags?.some(tag => selectedTags.value.includes(tag)))
})

function toggleTag(tag) {
    if (selectedTags.value.includes(tag)) {
        selectedTags.value = selectedTags.value.filter(t => t !== tag)
    } else {
        selectedTags.value.push(tag)
    }
}

function clearFilters() {
    selectedTags.value = []
}

// --- Фільтр + Сортування ---
const sortedPosts = computed(() => {
    let result = selectedTags.value.length === 0
        ? posts.value.slice()
        : posts.value.filter(post =>
            post.tags?.some(tag => selectedTags.value.includes(tag))
        )

    if (sortType.value === 'latest') {
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (sortType.value === 'mostComment') {
        result.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0))
    }

    return result
})

// --- SUGGESTED USERS ---
async function loadSuggestedUsers() {
    suggestedUsers.value = [
        { id: 1, name: 'Alice', avatar: null },
        { id: 2, name: 'Bob', avatar: null }
    ]
}

function sendContactRequest(userId) {
    console.log('Send request to', userId)
}

// ================= COMMENTS =================
function isOwnComment(comment) {
    // Якщо є comment.user_id — використовуємо його (старі коментарі)
    // Інакше беремо comment.user.id (нові коментарі)
    const commentUserId = comment.user_id ?? comment.user?.id
    return commentUserId === currentUser.value?.id
}

function isEditingComment(commentId) {
    return editingCommentId.value === commentId
}

// --- EDIT COMMENT ---
function startEdit(comment) {
    editingCommentId.value = comment.id
    editContent.value[comment.id] = comment.content
}

function confirmStartEdit(comment) {
    showConfirm(
        'Редагувати коментар?',
        'Ви дійсно хочете редагувати цей коментар?',
        () => startEdit(comment)
    )
}

function cancelEdit(commentId) {
    editingCommentId.value = null
    editContent.value[commentId] = ''
}

async function saveEdit(comment, post) {
    try {
        const content = editContent.value[comment.id]
        if (!content || !content.trim()) return

        await api.put(`/posts/comments/${comment.id}`, { content })
        comment.content = content
        editingCommentId.value = null
        editContent.value[comment.id] = ''
    } catch (err) {
        console.error('Failed to edit comment', err)
    }
}

function confirmSaveEdit(comment, post) {
    showConfirm(
        'Зберегти зміни?',
        'Ви дійсно хочете зберегти зміни в коментарі?',
        () => saveEdit(comment, post)
    )
}

// --- DELETE COMMENT ---
async function deleteComment(comment, post) {
    try {
        await api.delete(`/posts/comments/${comment.id}`)
        post.comments = post.comments.filter(c => c.id !== comment.id)
    } catch (err) {
        console.error('Failed to delete comment', err)
    }
}

function confirmDeleteComment(comment, post) {
    showConfirm(
        'Видалити коментар?',
        'Ви дійсно хочете видалити цей коментар?',
        () => deleteComment(comment, post)
    )
}

// --- ADD COMMENT ---
async function addComment(post) {
    const content = newComment.value[post.id]
    if (!content || !content.trim()) return
    try {
        const res = await api.post(`/posts/${post.id}/comments`, { content })
        const comment = res.data.comment

        // Додаємо вкладений user
        const normalizedComment = {
            ...comment,
            user: {
                id: currentUser.value.id,
                name: currentUser.value.name,
                avatar: currentUser.value.avatar || null
            }
        }

        if (!post.comments) post.comments = []
        post.comments.push(normalizedComment)
        newComment.value[post.id] = ''

        // Автоматично відкриваємо секцію коментарів
        if (!expandedPosts.value.includes(post.id)) {
            expandedPosts.value.push(post.id)
        }
    } catch (err) {
        console.error('Failed to add comment', err)
    }
}

function confirmAddComment(post) {
    showConfirm(
        'Додати коментар?',
        'Ви дійсно хочете додати цей коментар?',
        () => addComment(post)
    )
}

// --- GO TO PROFILE ---
function goToProfile(userId) {
    // якщо userId === поточний користувач
    if (userId === currentUser.value?.id) {
        router.push('/ProfileMe')
    } else {
        router.push({
            path: `/profile/${userId}`,
        })

    }
}

// ================= MOUNT =================
onMounted(() => {
    loadPosts()
    loadSuggestedUsers()
})
</script>



<style scoped>
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
    padding: 16px;
    background-color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.filter-card .v-card-title {
    font-weight: 700;
    font-size: 18px;
    padding-bottom: 8px;
}

.filter-chip {
    border-radius: 999px;
    border: 1px solid #97e5ee;
    background-color: #fff;
    color: #000;
    transition: all 0.2s;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
}

.filter-chip-selected {
    background: linear-gradient(90deg, #d3ffad 11%, #97e5ee 100%);
    color: #000;
    font-weight: 600;
    border: none;
}

.filter-chip:hover {
    background: rgba(151, 229, 238, 0.2);
}

.clear-btn {
    width: 100%;
    border-radius: 14px;
    height: 40px;
    font-weight: 600;
    text-transform: none;
    background: #f0f0f0;
    color: #333;
    margin-top: 20px;
}

.clear-btn:hover {
    background: #e0e0e0;
}

/* ===== CENTER: Post card ===== */
.post-card {
    border-radius: 18px;
    padding-bottom: 4px;
    background-color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
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
    /* для звичайних користувачів */
    color: #000;
}

.post-type.company-role {
    background: linear-gradient(90deg, #fde68a 0%, #f59e0b 100%);
    /* для company */
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

/* tags */
.post-tags .v-chip {
    font-size: 13px;
    font-weight: 500;
    border-radius: 12px;
    border: 1px solid #97e5ee;
    color: #000;
    background-color: #fff;
    transition: all 0.2s;
}

.post-tags .v-chip:hover {
    background: rgba(151, 229, 238, 0.2);
}

/* actions */
.post-card .v-btn {
    color: #555;
}

.post-card .v-btn:hover {
    color: #000;
}

/* ===== COMMENTS ===== */
.comment-bubble {
    background: linear-gradient(180deg,
            #ffffff 0%,
            #f6fbff 100%);
    border-radius: 16px;
    padding: 12px 16px;

    /* АКЦЕНТ */
    border: 1px solid rgba(151, 229, 238, 0.6);

    /* ТІНЬ */
    box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.06),
        0 1px 3px rgba(0, 0, 0, 0.04);

    width: 100%;
    position: relative;
}

/* КРАПЛЯ-ПОКАЖЧИК (як у месенджерах) */
.comment-bubble::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 14px;
    width: 12px;
    height: 12px;
    background: #ffffff;
    border-left: 1px solid rgba(151, 229, 238, 0.6);
    border-bottom: 1px solid rgba(151, 229, 238, 0.6);
    transform: rotate(45deg);
}

/* ===== SORT BUTTONS ===== */
.active-sort-btn {
    background: linear-gradient(90deg, #d3ffad 11%, #97e5ee 100%);
    color: #000;
    font-weight: 600;
}

/* ===== AVATAR ===== */
.comment-avatar {
    border: 2px solid #97e5ee;
    background: #fff;
}

/* ===== HEADER ===== */
.comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.comment-name {
    font-weight: 600;
    font-size: 14px;
    color: #1f2937;
}

/* ===== TEXT ===== */
.comment-text {
    font-size: 14px;
    color: #374151;
    line-height: 1.5;
}

/* ===== ACTIONS ===== */
.comment-actions {
    display: flex;
    gap: 6px;
}

.comment-actions .v-btn {
    opacity: 0.55;
    transition: opacity 0.2s, transform 0.2s;
}

.comment-actions .v-btn:hover {
    opacity: 1;
    transform: scale(1.1);
}

/* ===== ADD COMMENT ===== */

.comments-section .v-text-field {
    border-radius: 14px;
}

.comments-section .v-btn {
    border-radius: 999px;
    text-transform: none;
    font-weight: 600;
    background: linear-gradient(90deg, #d3ffad 11%, #97e5ee 100%);
    color: #000;
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
