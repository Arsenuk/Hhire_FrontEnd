<template>
  <v-container class="feed-page" fluid>
    <v-row>
      <v-col cols="12" md="2">
        <v-card class="filter-card">
          <section class="filter-section">
            <h2 class="filter-title">Intent</h2>

            <button
              v-for="intent in intentOptions"
              :key="intent.value"
              class="filter-option"
              type="button"
              @click="toggleIntent(intent.value)"
            >
              <span
                class="filter-box"
                :class="{ 'filter-box--active': selectedIntents.includes(intent.value) }"
              />
              <span class="filter-label">{{ intent.label }}</span>
              <span class="filter-count">{{ intentCounts[intent.value] || 0 }}</span>
            </button>

            <button
              v-if="selectedIntents.length"
              class="clear-section-btn"
              type="button"
              @click="clearIntentFilters"
            >
              All intents
            </button>
          </section>

          <section class="filter-section filter-section--separated">
            <h2 class="filter-title">User Types</h2>

            <button
              v-for="type in userTypeOptions"
              :key="type.value"
              class="filter-option"
              type="button"
              @click="selectUserType(type.value)"
            >
              <span
                class="filter-radio"
                :class="{ 'filter-radio--active': selectedUserType === type.value }"
              />
              <span class="filter-label">{{ type.label }}</span>
              <span class="filter-count">{{ userTypeCounts[type.value] || 0 }}</span>
            </button>
          </section>

          <button
            v-if="selectedIntents.length || selectedTags.length || selectedUserType !== 'all'"
            class="clear-btn"
            type="button"
            @click="clearFilters"
          >
            Clear
          </button>
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
    clearIntentFilters,
    clearFilters,
    goToProfile,
    hasMorePosts,
    intentCounts,
    intentOptions,
    isLoading,
    isLoadingMore,
    loadMoreTrigger,
    posts,
    selectUserType,
    selectedIntents,
    selectedTags,
    selectedUserType,
    sortType,
    sortedPosts,
    toggleIntent,
    toggleTag,
    topTags,
    userTypeCounts,
    userTypeOptions,
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
  border: 1px solid #dfe3ea;
  border-radius: 8px;
  padding: 18px 16px;
  background-color: #fff;
  box-shadow: none;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-section--separated {
  border-top: 1px solid #edf0f4;
  margin-top: 14px;
  padding-top: 14px;
}

.filter-title {
  color: #111827;
  font-weight: 700;
  font-size: 13px;
  line-height: 1.3;
  margin: 0 0 4px;
}

.filter-option {
  align-items: center;
  background: transparent;
  border: 0;
  color: #1f2937;
  cursor: pointer;
  display: grid;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  gap: 10px;
  grid-template-columns: 14px minmax(0, 1fr) auto;
  min-height: 16px;
  padding: 0;
  text-align: left;
  width: 100%;
}

.filter-option:hover .filter-label {
  color: #73AA43;
}

.filter-box,
.filter-radio {
  border: 1px solid #9ca3af;
  display: inline-flex;
  height: 14px;
  width: 14px;
}

.filter-box--active {
  align-items: center;
  background: #73AA43;
  border-color: #73AA43;
  justify-content: center;
}

.filter-box--active::after {
  border: solid #fff;
  border-width: 0 2px 2px 0;
  content: "";
  height: 7px;
  transform: rotate(45deg) translate(-1px, -1px);
  width: 4px;
}

.filter-radio {
  border-radius: 50%;
}

.filter-radio--active {
  border-color: #111827;
  box-shadow: inset 0 0 0 3px #fff;
  background: #111827;
}

.filter-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filter-count {
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
}

.clear-btn {
  background: transparent;
  border: 0;
  border-top: 1px solid #edf0f4;
  color: #64748b;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  margin-top: 14px;
  padding: 12px 0 0;
  text-align: left;
  width: 100%;
}

.clear-section-btn {
  background: transparent;
  border: 0;
  color: #64748b;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 0 0 24px;
  text-align: left;
}

.clear-section-btn:hover {
  color: #F50206;
}

.clear-btn:hover {
  color: #F50206;
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

.filter-chip-selected {
  background: linear-gradient(90deg, #d3ffad 11%, #97e5ee 100%);
  color: #000;
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
