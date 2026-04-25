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
                <div class="d-flex gap-3 mb-3">
                    <v-btn :class="{ 'active-sort-btn': sortType === 'latest' }" small @click="sortType = 'latest'">
                        Latest
                    </v-btn>
                </div>

                <PostCard v-for="post in sortedPosts" :key="post.id" class="mb-4" :post="post" variant="feed"
                    title-placement="header" :show-owner-role="true" :owner-clickable="true" :avatar-size="40"
                    @owner-click="goToProfile" />

                <v-btn v-if="posts.length < allPosts.length" class="load-more-btn mt-4" @click="loadMorePosts">
                    Load More Posts
                </v-btn>
            </v-col>

            <!-- ================= RIGHT: POPULAR TAGS ================= -->
            <v-col cols="12" md="4">
                <v-card class="suggested-card">
                    <v-card-title>Popular Tags</v-card-title>
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
    </v-container>
</template>

<script setup>
import PostCard from '@/components/posts/PostCard.vue'
import { useFeed } from '@/composables/useFeed.js'

const {
    allPosts,
    allTags,
    clearFilters,
    goToProfile,
    loadMorePosts,
    posts,
    selectedTags,
    sortType,
    sortedPosts,
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

/* ===== SORT BUTTONS ===== */
.active-sort-btn {
    background: linear-gradient(90deg, #d3ffad 11%, #97e5ee 100%);
    color: #000;
    font-weight: 600;
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
