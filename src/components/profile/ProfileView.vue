<template>
  <v-container fluid class="profile-page">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
          {{ errorMessage }}
        </v-alert>

        <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
          {{ successMessage }}
        </v-alert>
      </v-col>
    </v-row>

    <template v-if="user">
      <v-row class="profile-header mb-8" align="center">
        <v-col cols="12" md="2" class="text-center">
          <v-avatar size="120" class="avatar-border">
            <v-img :src="getAvatarUrl(user.avatar)" />
          </v-avatar>
        </v-col>

        <v-col cols="12" md="7">
          <h1 class="profile-name">
            {{ user.name || emptyInfoText }}
          </h1>
        </v-col>

        <v-col v-if="$slots['header-actions']" cols="12" md="3" class="text-md-right text-center">
          <slot name="header-actions" />
        </v-col>
      </v-row>

      <v-row class="mb-8">
        <v-col cols="12" md="8">
          <v-card class="profile-card">
            <v-card-title>Description</v-card-title>
            <v-card-text>
              {{ user.description || emptyInfoText }}
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="profile-card">
            <v-card-title class="d-flex justify-space-between align-center">
              Useful Links
              <slot name="links-title-actions" />
            </v-card-title>

            <v-card-text>
              <v-list density="compact">
                <v-list-item v-for="link in links" :key="link.id">
                  <v-list-item-title>
                    <a :href="link.url" target="_blank">
                      {{ link.description || link.url }}
                    </a>
                  </v-list-item-title>

                  <template v-if="$slots['link-append']" #append>
                    <slot name="link-append" :link="link" />
                  </template>
                </v-list-item>

                <v-list-item v-if="links.length === 0">
                  <v-list-item-title>{{ emptyInfoText }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-card class="profile-card">
            <v-card-title>Posts</v-card-title>

            <v-card-text>
              <v-row>
                <v-col v-for="post in posts" :key="post.id" cols="12" md="6">
                  <PostCard :post="post" variant="profile" title-placement="body" tag-prefix="#" hoverable>
                    <template v-if="$slots['post-actions']" #header-actions>
                      <slot name="post-actions" :post="post" />
                    </template>
                  </PostCard>
                </v-col>

                <v-col v-if="posts.length === 0" cols="12">
                  <p>{{ emptyPostsText }}</p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-row v-else justify="center" class="mt-10">
      <v-progress-circular indeterminate size="50" />
    </v-row>
  </v-container>
</template>

<script setup>
import PostCard from '@/components/posts/PostCard.vue'
import { getAvatarUrl } from '@/utils/postDisplay.js'

defineProps({
  user: {
    type: Object,
    default: null,
  },
  links: {
    type: Array,
    default: () => [],
  },
  posts: {
    type: Array,
    default: () => [],
  },
  errorMessage: {
    type: String,
    default: '',
  },
  successMessage: {
    type: String,
    default: '',
  },
  emptyInfoText: {
    type: String,
    default: 'User did not provide information',
  },
  emptyPostsText: {
    type: String,
    default: 'User did not provide posts',
  },
})
</script>

<style scoped>
.profile-page {
  background-color: #f9f9f9;
  min-height: 100vh;
  padding: clamp(80px, 10vh, 120px) 16px 16px;
  color: #e5e7eb;
}

.profile-header {
  background: linear-gradient(135deg, #baf2b3, #7b91f2cc);
  border-radius: 18px;
  padding: 24px;
}

.avatar-border {
  border: 3px solid #14b8a6;
}

.profile-name {
  font-size: 28px;
  font-weight: 700;
}

.profile-card {
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
}

a {
  color: #5eead4;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.v-list-item {
  border-radius: 12px;
  transition: background 0.2s ease;
}

.v-list-item:hover {
  background: rgba(20, 184, 166, 0.08);
}

.v-card-text {
  color: #94a3b8;
}

@media (max-width: 960px) {
  .profile-header {
    text-align: center;
  }
}
</style>
