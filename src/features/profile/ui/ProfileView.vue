<template>
  <v-container class="profile-page" fluid>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
          {{ errorMessage }}
        </v-alert>

        <v-alert v-if="successMessage" class="mb-4" type="success" variant="tonal">
          {{ successMessage }}
        </v-alert>
      </v-col>
    </v-row>

    <template v-if="user">
      <v-row align="center" class="profile-header mb-8">
        <v-col class="text-center" cols="12" md="2">
          <UserAvatar class="avatar-border" :size="120" :user="user" />
        </v-col>

        <v-col cols="12" md="7">
          <h1 class="profile-name">
            {{ getUserDisplayName(user, emptyInfoText) }}
          </h1>
        </v-col>

        <v-col v-if="$slots['header-actions']" class="text-md-right text-center" cols="12" md="3">
          <slot name="header-actions" />
        </v-col>
      </v-row>

      <v-row class="mb-8">
        <v-col cols="12" md="4">
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
              Contact Info
              <slot name="contact-title-actions" />
            </v-card-title>

            <v-card-text>
              <v-list density="compact">
                <v-list-item v-for="(contact, index) in contactInfo" :key="contact.id ?? contact.url ?? `contact-${index}`">
                  <v-list-item-title>
                    <a :href="contact.url" target="_blank">
                      {{ contact.description || contact.url }}
                    </a>
                  </v-list-item-title>

                  <template v-if="$slots['contact-append']" #append>
                    <slot :contact="contact" name="contact-append" />
                  </template>
                </v-list-item>

                <v-list-item v-if="contactInfo.length === 0">
                  <v-list-item-title>{{ emptyInfoText }}</v-list-item-title>
                </v-list-item>
              </v-list>
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
                <v-list-item v-for="(link, index) in links" :key="link.id ?? link.url ?? `link-${index}`">
                  <v-list-item-title>
                    <a :href="link.url" target="_blank">
                      {{ link.description || link.url }}
                    </a>
                  </v-list-item-title>

                  <template v-if="$slots['link-append']" #append>
                    <slot :link="link" name="link-append" />
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
          <v-card class="profile-card profile-posts-card">
            <v-card-title>Posts</v-card-title>

            <v-card-text>
              <div v-if="posts.length" class="profile-posts-list">
                <PostCard
                  v-for="(post, index) in posts"
                  :key="post.id ?? `post-${index}`"
                  :avatar-size="40"
                  hoverable
                  :post="post"
                  :show-owner-role="true"
                  variant="feed"
                >
                  <template v-if="$slots['post-actions']" #header-actions>
                    <slot name="post-actions" :post="post" />
                  </template>
                </PostCard>
              </div>

              <p v-else class="profile-posts-empty">
                {{ emptyPostsText }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-row v-else-if="loading" class="mt-10" justify="center">
      <v-progress-circular indeterminate size="50" />
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import PostCard from '@/entities/post/ui/PostCard.vue'
  import { getUserDisplayName } from '@/entities/user/lib/getUserDisplayName'
  import UserAvatar from '@/entities/user/ui/UserAvatar.vue'
  import type {
    ProfileContactView,
    ProfileLinkView,
    ProfilePostView,
    ProfileUserView,
  } from '@/features/profile/model/contracts'

  interface ProfileViewProps {
    user: ProfileUserView | null
    links?: ProfileLinkView[]
    contactInfo?: ProfileContactView[]
    posts?: ProfilePostView[]
    loading?: boolean
    errorMessage?: string
    successMessage?: string
    emptyInfoText?: string
    emptyPostsText?: string
  }

  defineSlots<{
    'header-actions'?: () => unknown
    'contact-title-actions'?: () => unknown
    'links-title-actions'?: () => unknown
    'contact-append'?: (props: { contact: ProfileContactView }) => unknown
    'link-append'?: (props: { link: ProfileLinkView }) => unknown
    'post-actions'?: (props: { post: ProfilePostView }) => unknown
  }>()

  withDefaults(defineProps<ProfileViewProps>(), {
    links: () => [],
    contactInfo: () => [],
    posts: () => [],
    loading: false,
    errorMessage: '',
    successMessage: '',
    emptyInfoText: 'User did not provide information',
    emptyPostsText: 'User did not provide posts',
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
  background: linear-gradient(170deg, #73AA43 20%, #63B5BE 50%);
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

.profile-posts-card {
  max-width: 920px;
  margin: 0 auto;
}

.profile-posts-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.profile-posts-empty {
  color: #64748b;
  font-size: 15px;
  margin: 0;
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
