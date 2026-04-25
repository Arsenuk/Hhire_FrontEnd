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
                <PostCard v-for="post in sortedPosts" :key="post.id" class="mb-4" :post="post" variant="feed"
                    title-placement="header" :show-owner-role="true" :owner-clickable="true" :avatar-size="40"
                    @owner-click="goToProfile">

                    <template #actions>
                        <v-btn icon @click="toggleComments(post.id)">
                            <v-icon>mdi-comment-outline</v-icon>
                        </v-btn>
                    </template>

                    <template #details>
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
                    </template>
                </PostCard>

                <!-- LOAD MORE -->
                <v-btn v-if="posts.length < allPosts.length" class="load-more-btn mt-4" @click="loadMorePosts">
                    Load More Posts
                </v-btn>
            </v-col>

            <!-- ================= RIGHT: POPULAR TAGS ================= -->
            <v-col cols="12" md="4">
                <v-card class="suggested-card">
                    <v-card-title>Популярні теги</v-card-title>
                    <v-card-text>
                        <v-row dense>
                            <v-chip v-for="tag in topTags" :key="tag" class="ma-1" color="primary" outlined small
                                @click="toggleTag(tag)" :class="{ 'filter-chip-selected': selectedTags.includes(tag) }">
                                #{{ tag }}
                            </v-chip>
                        </v-row>
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
import PostCard from '@/components/posts/PostCard.vue'
import { useFeed } from '@/composables/useFeed.js'

const {
    allPosts,
    allTags,
    cancelEdit,
    clearFilters,
    confirmAddComment,
    confirmDeleteComment,
    confirmDialog,
    confirmSaveEdit,
    confirmStartEdit,
    confirmText,
    confirmTitle,
    editContent,
    executeConfirmAction,
    expandedPosts,
    getAvatarUrl,
    goToProfile,
    isEditingComment,
    isOwnComment,
    loadMorePosts,
    newComment,
    posts,
    selectedTags,
    sortType,
    sortedPosts,
    toggleComments,
    toggleTag,
    topTags,
} = useFeed()
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

.post-intent .v-chip {
    background: rgba(255, 193, 7, 0.12);
    border-color: #facc15;
    color: #a16207;
    font-weight: 600;
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

