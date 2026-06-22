<template>
  <v-container class="feed-page" fluid>
    <v-row class="feed-layout" align="start">
      <v-col cols="12">
        <v-card class="feed-hero">
          <div class="feed-hero__copy">
            <p class="feed-kicker">Community feed</p>
            <h1 class="feed-title">Discover posts, opportunities, and conversations</h1>
            <p class="feed-description">
              Browse the latest posts, narrow them down by intent or user type, and jump into the most relevant discussions.
            </p>
          </div>

          <div class="feed-hero__meta">
            <div class="feed-stat">
              <span class="feed-stat__value">{{ posts.length }}</span>
              <span class="feed-stat__label">Visible posts</span>
            </div>

            <div class="feed-stat">
              <span class="feed-stat__value">{{ activeFiltersCount }}</span>
              <span class="feed-stat__label">Active filters</span>
            </div>

            <div class="feed-stat">
              <span class="feed-stat__value">{{ topTags.length }}</span>
              <span class="feed-stat__label">Trending tags</span>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" class="feed-sidebar-col">
        <v-card class="filter-card feed-sticky-card">
          <div class="feed-panel-header">
            <div>
              <p class="feed-panel-eyebrow">Refine feed</p>
              <h2 class="feed-panel-title">Filters</h2>
            </div>

            <v-chip size="small" variant="tonal" color="primary">
              {{ activeFiltersCount }}
            </v-chip>
          </div>

          <section class="filter-section">
            <h3 class="filter-title">Intent</h3>

            <button
              v-for="intent in intentOptions"
              :key="intent.value"
              class="filter-option"
              :class="{ 'filter-option--active': selectedIntents.includes(intent.value) }"
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
              Reset intent filters
            </button>
          </section>

          <section class="filter-section filter-section--separated">
            <h3 class="filter-title">User types</h3>

            <button
              v-for="type in userTypeOptions"
              :key="type.value"
              class="filter-option"
              :class="{ 'filter-option--active': selectedUserType === type.value }"
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
            Clear all filters
          </button>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" class="feed-main-col">
        <!-- <v-card class="feed-toolbar">
          <div class="feed-toolbar__head">
            <div>
              <p class="feed-panel-eyebrow">Sort feed</p>
              <h2 class="feed-panel-title">Feed order</h2>
            </div>

            <v-chip size="small" variant="tonal" color="secondary">
              Latest
            </v-chip>
          </div>

          <div class="feed-sort-group" role="group" aria-label="Feed sort options">
            <v-btn
              class="feed-sort-btn"
              :class="{ 'feed-sort-btn--active': sortType === 'latest' }"
              variant="tonal"
              rounded="pill"
              size="large"
              @click="sortType = 'latest'"
            >
              Latest
            </v-btn>
          </div>
        </v-card> -->

        <div v-if="isLoading" class="feed-loader">
          <v-progress-circular color="primary" indeterminate size="40" width="4" />
        </div>

        <div v-else-if="!sortedPosts.length" class="feed-empty-state">
          <v-icon icon="mdi-text-box-search-outline" size="40" color="primary" />
          <h3>{{ emptyStateTitle }}</h3>
          <p>{{ emptyStateDescription }}</p>
          <v-btn color="primary" variant="flat" rounded="pill" @click="resetFeedView">
            {{ emptyStateActionLabel }}
          </v-btn>
        </div>

        <PostCard
          v-for="post in sortedPosts"
          :key="post.id"
          :avatar-size="40"
          class="feed-post-card"
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
            width="3"
          />
          <span v-else-if="!hasMorePosts && posts.length" class="feed-end-text">
            No more posts
          </span>
        </div>
      </v-col>

      <v-col cols="12" md="3" class="feed-sidebar-col">
        <v-card class="suggested-card feed-sticky-card">
          <div class="feed-panel-header">
            <div>
              <p class="feed-panel-eyebrow">Trending</p>
              <h2 class="feed-panel-title">Popular tags</h2>
            </div>

            <v-chip size="small" variant="tonal">
              {{ topTags.length }}
            </v-chip>
          </div>

          <v-card-text class="suggested-card__body">
            <div v-if="topTags.length" class="tag-cloud">
              <v-chip
                v-for="tag in topTags"
                :key="tag"
                class="tag-chip"
                :class="{ 'tag-chip--selected': selectedTags.includes(tag) }"
                size="small"
                variant="outlined"
                @click="toggleTag(tag)"
              >
                #{{ formatPopularTag(tag) }}
              </v-chip>
            </div>

            <div v-else class="suggested-card__empty">
              <p>Tags will appear here once the feed has enough activity.</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-navigation-drawer
      v-model="mobileControlsOpen"
      class="feed-mobile-drawer"
      location="right"
      temporary
      width="340"
    >
      <div class="feed-mobile-drawer__head">
        <div>
          <p class="feed-panel-eyebrow">Feed controls</p>
          <h2 class="feed-panel-title">Filters and tags</h2>
        </div>

        <v-btn icon variant="text" @click="mobileControlsOpen = false">
          <v-icon icon="mdi-close" />
        </v-btn>
      </div>

      <v-card class="filter-card feed-mobile-drawer__card" flat>
        <div class="feed-panel-header">
          <div>
            <p class="feed-panel-eyebrow">Refine feed</p>
            <h2 class="feed-panel-title">Filters</h2>
          </div>

          <v-chip size="small" variant="tonal" color="primary">
            {{ activeFiltersCount }}
          </v-chip>
        </div>

        <section class="filter-section">
          <h3 class="filter-title">Intent</h3>

          <button
            v-for="intent in intentOptions"
            :key="intent.value"
            class="filter-option"
            :class="{ 'filter-option--active': selectedIntents.includes(intent.value) }"
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
            Reset intent filters
          </button>
        </section>

        <section class="filter-section filter-section--separated">
          <h3 class="filter-title">User types</h3>

          <button
            v-for="type in userTypeOptions"
            :key="type.value"
            class="filter-option"
            :class="{ 'filter-option--active': selectedUserType === type.value }"
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
          Clear all filters
        </button>
      </v-card>

      <v-card class="suggested-card feed-mobile-drawer__card" flat>
        <div class="feed-panel-header">
          <div>
            <p class="feed-panel-eyebrow">Trending</p>
            <h2 class="feed-panel-title">Popular tags</h2>
          </div>

            <v-chip size="small" variant="tonal">
              {{ topTags.length }}
            </v-chip>
          </div>

          <v-card-text class="suggested-card__body">
            <div v-if="topTags.length" class="tag-cloud">
              <v-chip
                v-for="tag in topTags"
                :key="tag"
                class="tag-chip"
                :class="{ 'tag-chip--selected': selectedTags.includes(tag) }"
                size="small"
                variant="outlined"
                @click="toggleTag(tag)"
              >
                {{ formatPopularTag(tag) }}
              </v-chip>
            </div>

          <div v-else class="suggested-card__empty">
            <p>Tags will appear here once the feed has enough activity.</p>
          </div>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>
  </v-container>
</template>

<script setup>
  import { computed } from 'vue'
  import PostCard from '@/entities/post/ui/PostCard.vue'
  import { useFeedControlsStore } from '@/features/feed/model/feedControls.store'
  import { useFeedSearchStore } from '@/features/feed/model/feedSearch.store'
  import { useFeed } from '@/features/feed/model/useFeed'

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
    isSearchActive,
    sortType,
    sortedPosts,
    toggleIntent,
    toggleTag,
    topTags,
    userTypeCounts,
    userTypeOptions,
  } = useFeed()

  const feedControlsStore = useFeedControlsStore()
  const feedSearchStore = useFeedSearchStore()

  const mobileControlsOpen = computed({
    get: () => feedControlsStore.mobileControlsOpen,
    set: value => {
      feedControlsStore.mobileControlsOpen = value
    },
  })

  const activeFiltersCount = computed(() => (
    selectedIntents.value.length +
    selectedTags.value.length +
    (selectedUserType.value !== 'all' ? 1 : 0)
  ))

  const emptyStateTitle = computed(() => (
    isSearchActive.value
      ? 'No posts match your search'
      : 'No posts match these filters'
  ))

  const emptyStateDescription = computed(() => (
    isSearchActive.value
      ? 'Try a different keyword or clear the search to bring more posts back into view.'
      : 'Try clearing one or two filters to bring the feed back into view.'
  ))

  const emptyStateActionLabel = computed(() => (
    isSearchActive.value || activeFiltersCount.value > 0
      ? 'Reset search and filters'
      : 'Refresh feed'
  ))

  function resetFeedView() {
    clearFilters()
    if (isSearchActive.value) {
      feedSearchStore.clearQuery()
    }
  }

  function formatPopularTag(tag) {
    return String(tag ?? '').trim().replace(/^#+/, '') || String(tag ?? '').trim()
  }
</script>

<style scoped>
.feed-page {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  margin-top: 48px;
  padding-top: 32px;
  padding-bottom: 56px;
  background:
    radial-gradient(circle at top left, rgba(151, 229, 238, 0.18), transparent 34%),
    radial-gradient(circle at top right, rgba(211, 255, 173, 0.16), transparent 28%),
    linear-gradient(180deg, #f8fbff 0%, #f4f7fb 52%, #eef3f8 100%);
}

.feed-layout {
  position: relative;
  z-index: 1;
}

.feed-hero,
.filter-card,
.suggested-card,
.feed-toolbar {
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(14px);
}

.feed-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 28px 24px;
}

.feed-hero__copy {
  max-width: 760px;
}

.feed-kicker,
.feed-panel-eyebrow {
  margin: 0 0 8px;
  color: #5b7088;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.feed-title {
  margin: 0;
  color: #0f172a;
  font-size: clamp(28px, 3vw, 44px);
  font-weight: 800;
  line-height: 1.06;
  letter-spacing: -0.03em;
}

.feed-description {
  max-width: 64ch;
  margin: 14px 0 0;
  color: #546274;
  font-size: 15px;
  line-height: 1.7;
}

.feed-hero__meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(92px, 1fr));
  gap: 12px;
  min-width: 316px;
}

.feed-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 90px;
  padding: 16px 16px 14px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.92));
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.feed-stat__value {
  color: #0f172a;
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
}

.feed-stat__label {
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
}

.feed-sidebar-col,
.feed-main-col {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.feed-mobile-drawer {
  display: none;
}

.feed-sticky-card {
  position: sticky;
  top: 96px;
}

.feed-panel-header,
.feed-toolbar__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.feed-panel-title {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 750;
  line-height: 1.2;
}

.feed-toolbar {
  padding: 20px 22px;
}

.feed-sort-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.feed-sort-btn {
  flex: 1 1 132px;
  min-width: 132px;
  justify-content: center;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.92));
  color: #475569;
  text-transform: none;
  letter-spacing: 0;
}

.feed-sort-btn--active {
  border-color: rgba(115, 170, 67, 0.24);
  background: linear-gradient(90deg, #d3ffad 11%, #97e5ee 100%);
  color: #0f172a;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(115, 170, 67, 0.16);
}

.filter-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 22px 20px 18px;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-section--separated {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
}

.filter-title {
  margin: 0 0 4px;
  color: #111827;
  font-size: 13px;
  font-weight: 750;
  line-height: 1.3;
  letter-spacing: 0.02em;
}

.filter-option {
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.88);
  color: #1f2937;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  transition: background-color 0.16s ease, border-color 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease;
}

.filter-option:hover {
  background: #fff;
  border-color: rgba(151, 229, 238, 0.7);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  transform: translateY(-1px);
}

.filter-option--active {
  background: linear-gradient(90deg, rgba(211, 255, 173, 0.28), rgba(151, 229, 238, 0.26));
  border-color: rgba(151, 229, 238, 0.8);
}

.filter-box,
.filter-radio {
  display: inline-flex;
  width: 16px;
  height: 16px;
  border: 1px solid #9ca3af;
}

.filter-box--active {
  align-items: center;
  justify-content: center;
  border-color: #73aa43;
  background: #73aa43;
  box-shadow: 0 0 0 3px rgba(115, 170, 67, 0.12);
}

.filter-box--active::after {
  content: "";
  width: 4px;
  height: 7px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translate(-1px, -1px);
}

.filter-radio {
  border-radius: 50%;
}

.filter-radio--active {
  border-color: #111827;
  background: #111827;
  box-shadow: inset 0 0 0 3px #fff;
}

.filter-label {
  overflow: hidden;
  color: #0f172a;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filter-count {
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
}

.clear-section-btn {
  padding: 4px 0 0 24px;
  border: 0;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  text-align: left;
}

.clear-section-btn:hover {
  color: #c026d3;
}

.clear-btn {
  width: 100%;
  margin-top: 16px;
  padding: 12px 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 14px;
  background: linear-gradient(90deg, rgba(248, 250, 252, 0.96), rgba(241, 245, 249, 0.96));
  color: #64748b;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  transition: background-color 0.16s ease, color 0.16s ease, border-color 0.16s ease, transform 0.16s ease;
}

.clear-btn:hover {
  color: #0f172a;
  border-color: rgba(151, 229, 238, 0.8);
  transform: translateY(-1px);
}

.suggested-card {
  padding: 22px 20px 18px;
}

.suggested-card__body {
  padding: 0;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-chip {
  border-color: rgba(151, 229, 238, 0.8);
  background: rgba(255, 255, 255, 0.72);
  color: #0f172a;
  transition: transform 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease;
}

.tag-chip:hover {
  background: rgba(248, 250, 252, 0.98);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.07);
  transform: translateY(-1px);
}

.tag-chip--selected {
  border-color: rgba(115, 170, 67, 0.6);
  background: linear-gradient(90deg, rgba(211, 255, 173, 0.45), rgba(151, 229, 238, 0.36));
  color: #0f172a;
  font-weight: 700;
}

.suggested-card__empty {
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

.feed-loader,
.load-more-trigger {
  display: flex;
  justify-content: center;
  min-height: 80px;
  padding: 20px 0;
}

.feed-end-text {
  color: #687385;
  font-size: 14px;
  font-weight: 500;
}

.feed-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 8px 0 12px;
  padding: 34px 20px;
  border: 1px dashed rgba(148, 163, 184, 0.35);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.72);
  text-align: center;
}

.feed-empty-state h3 {
  margin: 0;
  color: #0f172a;
  font-size: 20px;
  font-weight: 750;
  line-height: 1.25;
}

.feed-empty-state p {
  max-width: 48ch;
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.65;
}

.feed-post-card {
  margin-bottom: 18px;
}

@media (max-width: 960px) {
  .feed-page {
    margin-top: 28px;
    padding-top: 20px;
    padding-bottom: 40px;
  }

  .feed-hero {
    flex-direction: column;
    align-items: flex-start;
    padding: 22px 20px;
  }

  .feed-hero__meta {
    width: 100%;
    min-width: 0;
  }

  .feed-sticky-card {
    position: static;
  }

  .feed-toolbar,
  .filter-card,
  .suggested-card {
    padding: 20px 18px 18px;
  }

  .feed-sidebar-col {
    display: none;
  }

  .feed-mobile-drawer {
    display: flex;
    flex-direction: column;
    padding: 18px 16px 20px;
    overflow-y: auto;
    background:
      radial-gradient(circle at top left, rgba(151, 229, 238, 0.14), transparent 34%),
      linear-gradient(180deg, #f8fbff 0%, #f4f7fb 52%, #eef3f8 100%);
  }

  .feed-mobile-drawer__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .feed-mobile-drawer__card {
    margin-bottom: 16px;
  }

  .post-card__feed-header {
    flex-direction: column;
    gap: 16px;
    padding: 22px 20px 16px;
  }

  .post-card__feed-badges {
    flex-direction: row;
    align-items: center;
    align-self: stretch;
    flex-wrap: wrap;
  }

  .post-card__feed-body {
    padding: 20px 20px 24px;
  }

  .post-card__title--feed {
    margin-left: 0;
  }

  .post-card__content-box,
  .post-card__image-box {
    width: 100%;
  }

  .post-card__content-box {
    min-height: 150px;
    padding: 20px;
  }

  .post-card__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .post-card__header-actions {
    align-self: flex-end;
  }

  .post-card__meta--split {
    flex-direction: column;
    gap: 4px;
  }
}

@media (max-width: 600px) {
  .feed-hero__meta {
    grid-template-columns: 1fr;
  }

  .feed-stat {
    min-height: 74px;
  }

  .feed-sort-btn {
    min-width: 100%;
  }

  .post-card__feed-owner {
    width: 100%;
  }

  .post-card__feed-header .post-card__owner-name {
    font-size: 20px;
  }

  .post-card__feed-date {
    font-size: 12px;
  }

  .post-card__role {
    min-height: 32px;
    font-size: 14px;
  }
}
</style>
