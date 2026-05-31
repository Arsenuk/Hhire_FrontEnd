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
      <section class="profile-hero">
        <div class="profile-hero__media">
          <UserAvatar class="avatar-border" :size="124" :user="user" />
        </div>

        <div class="profile-hero__body">
          <div class="profile-hero__eyebrow">
            Profile overview
          </div>

          <h1 class="profile-name">
            {{ getUserDisplayName(user, emptyInfoText) }}
          </h1>

          <p class="profile-summary">
            {{ user.description || emptyInfoText }}
          </p>

          <div class="profile-stats">
            <div v-if="showContactInfo" class="profile-stat">
              <span class="profile-stat__value">{{ contactInfo.length }}</span>
              <span class="profile-stat__label">Contacts</span>
            </div>
            <div class="profile-stat">
              <span class="profile-stat__value">{{ links.length }}</span>
              <span class="profile-stat__label">Links</span>
            </div>
            <div class="profile-stat">
              <span class="profile-stat__value">{{ posts.length }}</span>
              <span class="profile-stat__label">Posts</span>
            </div>
          </div>
        </div>

        <div v-if="$slots['header-actions']" class="profile-hero__actions">
          <slot name="header-actions" />
        </div>
      </section>

      <nav class="profile-nav" aria-label="Profile sections">
        <div class="profile-nav__label">
          Quick sections
        </div>

        <div class="profile-nav__tabs">
          <v-btn
            v-for="section in sections"
            :key="section.id"
            class="profile-nav__tab"
            :class="{ 'profile-nav__tab--active': activeSection === section.id }"
            :variant="activeSection === section.id ? 'flat' : 'tonal'"
            @click="scrollToSection(section.id)"
          >
            {{ section.label }}
          </v-btn>
        </div>
      </nav>

      <v-row class="profile-sections" dense>
        <v-col cols="12" md="7">
          <v-card id="about" class="profile-card profile-section profile-section--about">
            <div class="profile-section__header profile-section__header--about">
              <div class="profile-section__heading">
                <div class="profile-section__icon profile-section__icon--about">
                  <v-icon size="18">mdi-account-details-outline</v-icon>
                </div>

                <div>
                  <div class="profile-section__eyebrow">About</div>
                  <v-card-title class="profile-section__title">Description</v-card-title>
                </div>
              </div>

              <div class="profile-section__subtitle">
                A quick snapshot of the person behind the profile.
              </div>
            </div>

            <v-card-text class="profile-section__text">
              {{ user.description || emptyInfoText }}
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="5">
          <v-row dense>
            <v-col v-if="showContactInfo" cols="12">
              <v-card id="contacts" class="profile-card profile-section profile-section--contacts">
                <div class="profile-section__header profile-section__header--compact">
                  <div class="profile-section__heading">
                    <div class="profile-section__icon profile-section__icon--contacts">
                      <v-icon size="18">mdi-card-account-phone-outline</v-icon>
                    </div>

                    <div>
                      <div class="profile-section__eyebrow">Contact Info</div>
                      <v-card-title class="profile-section__title profile-section__title--spaced">
                        <span>Reach out</span>
                        <slot name="contact-title-actions" />
                      </v-card-title>
                    </div>
                  </div>

                  <div class="profile-section__subtitle">
                    Direct ways to contact this user.
                  </div>
                </div>

                <v-card-text>
                  <v-list class="profile-list" density="compact">
                    <v-list-item
                      v-for="(contact, index) in contactInfo"
                      :key="contact.id ?? contact.url ?? `contact-${index}`"
                      class="profile-list-item profile-list-item--contact"
                    >
                      <template #prepend>
                        <div class="profile-list-item__badge profile-list-item__badge--contact">
                          <v-icon size="16">mdi-at</v-icon>
                        </div>
                      </template>

                      <div class="profile-list-item__content">
                        <v-list-item-title class="profile-list-item__title">
                          <a :href="contact.url" rel="noreferrer" target="_blank">
                            {{ contact.description || contact.url }}
                          </a>
                        </v-list-item-title>

                        <v-list-item-subtitle
                          v-if="contact.description && contact.url && contact.description !== contact.url"
                          class="profile-list-item__subtitle"
                        >
                          {{ contact.url }}
                        </v-list-item-subtitle>
                      </div>

                      <template v-if="$slots['contact-append']" #append>
                        <slot :contact="contact" name="contact-append" />
                      </template>
                    </v-list-item>

                    <v-list-item v-if="contactInfo.length === 0" class="profile-list-item profile-list-item--empty">
                      <v-list-item-title class="profile-list-item__title">
                        {{ emptyInfoText }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12">
              <v-card id="links" class="profile-card profile-section profile-section--links">
                <div class="profile-section__header profile-section__header--compact">
                  <div class="profile-section__heading">
                    <div class="profile-section__icon profile-section__icon--links">
                      <v-icon size="18">mdi-link-variant</v-icon>
                    </div>

                    <div>
                      <div class="profile-section__eyebrow">Useful Links</div>
                      <v-card-title class="profile-section__title profile-section__title--spaced">
                        <span>Open resources</span>
                        <slot name="links-title-actions" />
                      </v-card-title>
                    </div>
                  </div>

                  <div class="profile-section__subtitle">
                    Portfolio, socials, and other important references.
                  </div>
                </div>

                <v-card-text>
                  <v-list class="profile-list" density="compact">
                    <v-list-item
                      v-for="(link, index) in links"
                      :key="link.id ?? link.url ?? `link-${index}`"
                      class="profile-list-item profile-list-item--link"
                    >
                      <template #prepend>
                        <div class="profile-list-item__badge profile-list-item__badge--link">
                          <v-icon size="16">mdi-open-in-new</v-icon>
                        </div>
                      </template>

                      <div class="profile-list-item__content">
                        <v-list-item-title class="profile-list-item__title">
                          <a :href="link.url" rel="noreferrer" target="_blank">
                            {{ link.description || link.url }}
                          </a>
                        </v-list-item-title>

                        <v-list-item-subtitle
                          v-if="link.description && link.url && link.description !== link.url"
                          class="profile-list-item__subtitle"
                        >
                          {{ link.url }}
                        </v-list-item-subtitle>
                      </div>

                      <template v-if="$slots['link-append']" #append>
                        <slot :link="link" name="link-append" />
                      </template>
                    </v-list-item>

                    <v-list-item v-if="links.length === 0" class="profile-list-item profile-list-item--empty">
                      <v-list-item-title class="profile-list-item__title">
                        {{ emptyInfoText }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-card id="posts" class="profile-card profile-posts-card profile-section">
            <div class="profile-section__header profile-section__header--posts">
              <div>
                <div class="profile-section__eyebrow">Content</div>
                <v-card-title class="profile-section__title">Posts</v-card-title>
              </div>

              <div class="profile-posts-count">
                {{ posts.length }} total
              </div>
            </div>

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
  import { computed, onBeforeUnmount, onMounted, ref, toRefs } from 'vue'
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
    showContactInfo?: boolean
  }

  const props = withDefaults(defineProps<ProfileViewProps>(), {
    links: () => [],
    contactInfo: () => [],
    posts: () => [],
    loading: false,
    errorMessage: '',
    successMessage: '',
    emptyInfoText: 'User did not provide information',
    emptyPostsText: 'User did not provide posts',
    showContactInfo: true,
  })

  const {
    contactInfo,
    emptyInfoText,
    emptyPostsText,
    errorMessage,
    loading,
    links,
    posts,
    showContactInfo,
    successMessage,
    user,
  } = toRefs(props)

  defineSlots<{
    'header-actions'?: () => unknown
    'contact-title-actions'?: () => unknown
    'links-title-actions'?: () => unknown
    'contact-append'?: (props: { contact: ProfileContactView }) => unknown
    'link-append'?: (props: { link: ProfileLinkView }) => unknown
    'post-actions'?: (props: { post: ProfilePostView }) => unknown
  }>()

  const sections = computed(() => {
    const items = [
      { id: 'about', label: 'About' },
    ]

    if (showContactInfo.value) {
      items.push({ id: 'contacts', label: 'Contacts' })
    }

    items.push(
      { id: 'links', label: 'Links' },
      { id: 'posts', label: 'Posts' }
    )

    return items
  })

  const activeSection = ref<'about' | 'contacts' | 'links' | 'posts'>('about')
  let sectionObserver: IntersectionObserver | null = null

  function scrollToSection (sectionId: string) {
    const element = document.getElementById(sectionId)

    if (!element) return

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  onMounted(() => {
    const observedSections = sections.value
      .map(section => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element))

    if (!observedSections.length || !('IntersectionObserver' in window)) return

    sectionObserver = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visible?.target instanceof HTMLElement) {
          activeSection.value = visible.target.id as typeof activeSection.value
        }
      },
      {
        rootMargin: '-20% 0px -65% 0px',
        threshold: [0.2, 0.4, 0.6, 0.8],
      }
    )

    observedSections.forEach(section => sectionObserver?.observe(section))
  })

  onBeforeUnmount(() => {
    sectionObserver?.disconnect()
  })
</script>

<style scoped>
.profile-page {
  background:
    radial-gradient(circle at top left, rgba(211, 255, 173, 0.45), transparent 30%),
    radial-gradient(circle at top right, rgba(151, 229, 238, 0.35), transparent 28%),
    linear-gradient(180deg, #f8fafc 0%, #f3f7fb 100%);
  min-height: 100vh;
  padding: clamp(80px, 10vh, 120px) 16px 32px;
  color: #0f172a;
}

.profile-hero {
  align-items: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.75));
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 28px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  display: grid;
  gap: 20px;
  grid-template-columns: auto minmax(0, 1fr) auto;
  margin-bottom: 20px;
  padding: 28px;
  backdrop-filter: blur(18px);
}

.avatar-border {
  border: 4px solid rgba(20, 184, 166, 0.2);
  border-radius: 50%;
}

.profile-name {
  color: #0f172a;
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 700;
  line-height: 1.1;
  margin: 4px 0 10px;
}

.profile-hero__eyebrow,
.profile-section__eyebrow {
  color: #0f766e;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.profile-summary {
  color: #475569;
  font-size: 15px;
  line-height: 1.7;
  margin: 0;
  max-width: 60ch;
}

.profile-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
}

.profile-stat {
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 18px;
  min-width: 100px;
  padding: 12px 14px;
}

.profile-stat__value {
  display: block;
  color: #0f172a;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.1;
}

.profile-stat__label {
  color: #64748b;
  display: block;
  font-size: 12px;
  margin-top: 4px;
}

.profile-hero__actions {
  align-self: start;
  display: flex;
  justify-content: flex-end;
}

.profile-nav {
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 22px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 14px;
  position: sticky;
  top: 100px;
  z-index: 4;
  backdrop-filter: blur(14px);
}

.profile-nav__label {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
}

.profile-nav__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.profile-nav__tab {
  border-radius: 999px;
  color: #334155;
  font-weight: 600;
  letter-spacing: 0;
  min-height: 38px;
  padding-inline: 16px;
  text-transform: none;
}

.profile-nav__tab--active {
  background: linear-gradient(90deg, #d3ffad, #97e5ee);
  color: #020617;
  box-shadow: 0 10px 24px rgba(20, 184, 166, 0.14);
}

.profile-nav__tab:hover {
  transform: translateY(-1px);
}

.profile-nav__tab :deep(.v-btn__overlay) {
  opacity: 0.08;
}

.profile-nav__tab :deep(.v-btn__content) {
  font-size: 13px;
}

.profile-sections {
  margin-bottom: 12px;
}

.profile-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 22px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.profile-section {
  scroll-margin-top: 120px;
  position: relative;
}

.profile-section::before {
  content: '';
  display: block;
  height: 4px;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}

.profile-section--about::before {
  background: linear-gradient(90deg, #0f766e, #97e5ee);
}

.profile-section--contacts::before {
  background: linear-gradient(90deg, #8b5cf6, #c4b5fd);
}

.profile-section--links::before {
  background: linear-gradient(90deg, #0ea5e9, #67e8f9);
}

.profile-section__header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px 0;
}

.profile-section__header--compact {
  align-items: start;
  gap: 10px;
}

.profile-section__header--posts {
  padding-bottom: 4px;
}

.profile-section__heading {
  align-items: center;
  display: flex;
  gap: 12px;
}

.profile-section__icon {
  align-items: center;
  border-radius: 14px;
  display: inline-flex;
  flex: 0 0 auto;
  height: 36px;
  justify-content: center;
  width: 36px;
}

.profile-section__icon--about {
  background: rgba(15, 118, 110, 0.1);
  color: #0f766e;
}

.profile-section__icon--contacts {
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
}

.profile-section__icon--links {
  background: rgba(14, 165, 233, 0.1);
  color: #0284c7;
}

.profile-section__title {
  color: #0f172a;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  padding: 0;
}

.profile-section__title--spaced {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.profile-section__text {
  color: #334155;
  font-size: 16px;
  line-height: 1.9;
  padding: 16px 20px 22px;
  white-space: pre-wrap;
  word-break: break-word;
}

.profile-section__subtitle {
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
  max-width: 28ch;
  text-align: right;
}

.profile-list {
  gap: 10px;
  padding: 4px 12px 16px;
}

.profile-list-item {
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.98), rgba(255, 255, 255, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
  margin: 0;
  min-height: 58px;
  padding-block: 12px;
}

.profile-list-item__content {
  min-width: 0;
}

.profile-list-item__title {
  color: #0f172a;
  font-weight: 600;
}

.profile-list-item__subtitle {
  color: #64748b;
  font-size: 12px;
  margin-top: 4px;
}

.profile-list-item__badge {
  align-items: center;
  border-radius: 12px;
  display: inline-flex;
  flex: 0 0 auto;
  height: 30px;
  justify-content: center;
  width: 30px;
}

.profile-list-item__badge--contact {
  background: rgba(139, 92, 246, 0.12);
  color: #7c3aed;
}

.profile-list-item__badge--link {
  background: rgba(14, 165, 233, 0.12);
  color: #0284c7;
}

.profile-list-item--empty {
  background: rgba(15, 23, 42, 0.03);
  border-style: dashed;
  box-shadow: none;
}

.profile-list-item--empty .profile-list-item__title {
  color: #64748b;
}

.profile-posts-card {
  margin: 0 auto;
  max-width: 980px;
}

.profile-posts-count {
  align-self: flex-start;
  background: rgba(15, 118, 110, 0.08);
  border-radius: 999px;
  color: #0f766e;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 8px 12px;
  text-transform: uppercase;
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
  color: #0f766e;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.v-list-item {
  border-radius: 14px;
  margin: 0 4px;
  transition: background 0.2s ease, transform 0.2s ease;
}

.v-list-item:hover {
  background: rgba(15, 118, 110, 0.06);
  transform: translateY(-1px);
}

.v-card-text {
  color: #334155;
}

@media (max-width: 960px) {
  .profile-hero {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .profile-hero__actions {
    justify-content: center;
  }

  .profile-stats {
    justify-content: center;
  }

  .profile-nav {
    top: 88px;
  }
}

@media (max-width: 600px) {
  .profile-page {
    padding-left: 12px;
    padding-right: 12px;
  }

  .profile-hero {
    padding: 20px;
    border-radius: 22px;
  }

  .profile-section__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .profile-section__subtitle {
    max-width: none;
    text-align: left;
  }

  .profile-section__text {
    padding: 14px 16px 18px;
  }

  .profile-nav {
    top: 80px;
  }

  .profile-nav__label {
    width: 100%;
  }
}
</style>
