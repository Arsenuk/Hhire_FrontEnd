<template>
  <v-container class="feed-page" fluid>
    <v-row>
      <v-col cols="12" md="2">
        <v-card class="filter-card">
          <v-card-title>Filters</v-card-title>
          <v-card-text>
            <v-row dense>
              <v-list-item
                v-for="tag in allTags"
                :key="tag"
                class="filter-list-item"
                dense
                @click="toggleTag(tag)"
              >
                <v-chip class="filter-chip" :class="{ 'filter-chip-selected': selectedTags.includes(tag) }" outlined small>
                  {{ tag }}
                </v-chip>
              </v-list-item>
            </v-row>

            <v-btn class="mt-4 clear-btn" small @click="clearFilters">
              Clear
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <div class="d-flex gap-3 mb-3">
          <v-btn :class="{ 'active-sort-btn': sortType === 'latest' }" small @click="sortType = 'latest'">
            Latest
          </v-btn>
        </div>

        <div v-if="isLoading" class="feed-loader">
          <v-progress-circular color="primary" indeterminate />
        </div>

        <PostCard
          v-for="post in sortedPosts"
          :key="post.id"
          :avatar-size="40"
          class="mb-4"
          :owner-clickable="true"
          :post="post"
          :show-owner-role="true"
          title-placement="header"
          variant="feed"
          @owner-click="goToProfile"
        />

        <div ref="loadMoreTrigger" class="load-more-trigger">
          <v-progress-circular
            v-if="isLoadingMore"
            color="primary"
            indeterminate
            size="28"
          />
          <span v-else-if="!hasMorePosts && posts.length" class="feed-end-text">
            No more posts
          </span>
        </div>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="suggested-card">
          <v-card-title>Popular Tags</v-card-title>
          <v-card-text>
            <v-row dense>
              <v-chip
                v-for="tag in topTags"
                :key="tag"
                class="ma-1"
                :class="{ 'filter-chip-selected': selectedTags.includes(tag) }"
                color="primary"
                outlined
                small
                @click="toggleTag(tag)"
              >
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
  import PostCard from '@/entities/post/ui/PostCard.vue'
  import { useFeed } from '@/features/feed/model/useFeed.js'

  const {
    allTags,
    clearFilters,
    goToProfile,
    hasMorePosts,
    isLoading,
    isLoadingMore,
    loadMoreTrigger,
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

.active-sort-btn {
  background: linear-gradient(90deg, #d3ffad 11%, #97e5ee 100%);
  color: #000;
  font-weight: 600;
}

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

.feed-loader,
.load-more-trigger {
  display: flex;
  justify-content: center;
  min-height: 64px;
  padding: 16px 0;
}

.feed-end-text {
  color: #687385;
  font-size: 14px;
  font-weight: 500;
}
</style>
