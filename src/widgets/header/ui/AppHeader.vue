<template>
  <div class="app-shell">
    <v-app-bar
      class="hhire-header"
      :height="headerHeight"
      flat
    >
      <div ref="headerContentRef" class="header-content">
        <div class="header-left">
          <img alt="Hhire logo" class="logo" src="@/shared/assets/hhire-logo.png">
          <span class="brand-name">Hhire</span>
        </div>

        <div class="header-center">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            class="nav-link"
            :class="{ active: isActive(link.to) }"
            :to="link.to"
          >
            {{ link.label }}
          </RouterLink>
        </div>

        <div v-if="showFeedSearch" class="header-search">
          <v-text-field
            v-model="feedSearchQuery"
            class="header-search__input"
            clearable
            density="comfortable"
            hide-details
            prepend-inner-icon="mdi-magnify"
            placeholder="Search posts"
            label="Search posts"
            variant="outlined"
            @click:clear="clearFeedSearch"
          />
        </div>

        <div class="header-right">
          <template v-if="isLoggedIn">
            <v-menu offset-y>
              <template #activator="{ props }">
                <v-btn v-bind="props" class="position-relative" icon>
                  <v-icon>mdi-bell</v-icon>
                  <span v-if="unansweredSignals > 0" class="notif-count">{{ unansweredSignals }}</span>
                </v-btn>
              </template>
              <v-card style="width: 300px;">
                <v-card-title>Notifications</v-card-title>
                <v-card-text>
                  <v-list>
                    <v-list-item v-if="unansweredSignals === 0">
                      <v-list-item-title>No new signals</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-else>
                      <v-list-item-title>
                        You have {{ unansweredSignals }} signals awaiting reply
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-menu>

            <RouterLink to="/CreatePost">
              <v-btn class="create-post-btn" rounded>
                Create Post
              </v-btn>
            </RouterLink>

            <v-menu offset-y>
              <template #activator="{ props }">
                <v-btn icon v-bind="props">
                  <UserAvatar :alt="`${getUserDisplayName(user)} avatar`" :size="36" :user="user" />
                </v-btn>
              </template>
              <v-list>
                <RouterLink to="/ProfileMe">
                  <v-list-item>
                    <v-list-item-title>Profile</v-list-item-title>
                  </v-list-item>
                </RouterLink>
                <v-list-item @click="logout">
                  <v-list-item-title>Log out</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>

          <template v-else>
            <RouterLink class="login-link" to="/LogIn">Log In</RouterLink>
            <RouterLink to="/SignUp">
              <v-btn class="signup-btn" elevation="0" rounded>Sign Up</v-btn>
            </RouterLink>
          </template>
        </div>
      </div>
    </v-app-bar>

    <nav ref="mobileNavRef" v-if="navLinks.length > 1" class="mobile-nav" aria-label="Primary navigation">
      <RouterLink
        v-for="item in mobileNavItems"
        :key="`mobile-${item.to}-${item.label}`"
        :to="item.to"
        custom
        v-slot="{ href, navigate, isExactActive }"
      >
        <button
          v-if="item.action"
          type="button"
          class="mobile-nav__link"
          :class="item.label === 'Filters' ? 'mobile-nav__link--filters' : ''"
          @click="item.action()"
        >
          <v-icon v-if="item.icon" :icon="item.icon" size="18" />
          <span class="mobile-nav__label">{{ item.label }}</span>
        </button>

        <a
          v-else
          :href="href"
          class="mobile-nav__link"
          :class="[
            { 'mobile-nav__link--active': isExactActive },
            item.label === 'Create Post' ? 'mobile-nav__link--create-post' : '',
          ]"
          @click="navigate"
        >
          <v-icon v-if="item.icon" :icon="item.icon" size="18" />
          <span class="mobile-nav__label">{{ item.label }}</span>
        </a>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { getUserDisplayName } from '@/entities/user/lib/getUserDisplayName'
  import UserAvatar from '@/entities/user/ui/UserAvatar.vue'
  import { useAuthStore } from '@/features/auth/model/auth.store'
  import { useFeedControlsStore } from '@/features/feed/model/feedControls.store'
  import { useFeedSearchStore } from '@/features/feed/model/feedSearch.store'
  import { api } from '@/shared/api/api'
  import { canAccessAdminPanel } from '@/shared/lib/auth/adminPanelAccess'
  import type { EntityId } from '@/shared/types'

  type NavLink = {
    label: string
    to: string
  }

  type MobileNavItem = NavLink & {
    icon?: string
    variant?: 'primary'
    action?: () => void
  }

  type InboxConversation = {
    conversation_status?: string
  }

  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const feedControlsStore = useFeedControlsStore()
  const feedSearchStore = useFeedSearchStore()
  const headerContentRef = ref<HTMLElement | null>(null)
  const mobileNavRef = ref<HTMLElement | null>(null)
  const headerHeight = ref(88)
  const mobileNavHeight = ref(92)

  const isLoggedIn = computed(() => authStore.isLoggedIn)
  const user = computed(() => authStore.user)
  const hasAdminPanelAccess = computed(() => canAccessAdminPanel(user.value))
  const isFeedRoute = computed(() => route.path.toLowerCase() === '/feed')
  const showFeedSearch = computed(() => isFeedRoute.value)
  const feedSearchQuery = computed({
    get: () => feedSearchStore.query,
    set: value => feedSearchStore.setQuery(value),
  })

  const navLinks = computed<NavLink[]>(() => {
    if (isLoggedIn.value) {
      const links = [
        { label: 'Feed', to: '/Feed' },
        { label: 'Contacts', to: '/Contacts' },
      ]

      if (hasAdminPanelAccess.value) {
        links.push({ label: 'Admin Panel', to: '/AdminPanel' })
      }

      return links
    }

    return [
      { label: 'Get Started', to: '/' },
      { label: 'Feed', to: '/Feed' },
    ]
  })

  const mobileNavItems = computed<MobileNavItem[]>(() => {
    const items: MobileNavItem[] = [
      { label: 'Feed', to: '/Feed', icon: 'mdi-home-variant-outline' },
      { label: 'Contacts', to: '/Contacts', icon: 'mdi-account-group-outline' },
    ]

    if (isLoggedIn.value) {
      items.push({
        label: 'Create Post',
        to: '/CreatePost',
        icon: 'mdi-plus-circle-outline',
        variant: 'primary',
      })

      if (route.path.toLowerCase() === '/feed') {
        items.push({
          label: 'Filters',
          to: '/Feed',
          icon: 'mdi-tune-variant',
          variant: 'primary',
          action: () => feedControlsStore.openMobileControls(),
        })
      }

      if (hasAdminPanelAccess.value) {
        items.push({
          label: 'Admin Panel',
          to: '/AdminPanel',
          icon: 'mdi-shield-crown-outline',
        })
      }
    } else {
      items.unshift({
        label: 'Get Started',
        to: '/',
        icon: 'mdi-rocket-launch-outline',
      })
    }

    return items
  })

  const isActive = (path: string) => route.path.toLowerCase() === path.toLowerCase()

  async function logout () {
    await authStore.logout()
    await router.push('/')
  }

  function clearFeedSearch () {
    feedSearchStore.clearQuery()
  }

  const unansweredSignals = ref(0)

  let resizeObserver: ResizeObserver | null = null
  let mobileNavResizeObserver: ResizeObserver | null = null

  function syncHeaderHeight () {
    const height = headerContentRef.value?.getBoundingClientRect().height

    if (!height) return

    headerHeight.value = Math.ceil(height)
    document.documentElement.style.setProperty('--app-header-height', `${headerHeight.value}px`)
  }

  function syncMobileNavHeight () {
    const height = mobileNavRef.value?.getBoundingClientRect().height

    if (!height) return

    mobileNavHeight.value = Math.ceil(height)
    document.documentElement.style.setProperty('--app-mobile-nav-height', `${mobileNavHeight.value}px`)
  }

  async function fetchUnansweredSignals () {
    if (!isLoggedIn.value) return
    try {
      const res = await api.get<{ conversations?: InboxConversation[] }>('/conversations/inbox')
      unansweredSignals.value = (res.data.conversations || [])
        .filter(item => item.conversation_status === 'open')
        .length
    } catch (error) {
      console.error('Failed to fetch signals', error)
    }
  }

  let intervalId: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    nextTick(() => {
      syncHeaderHeight()
      syncMobileNavHeight()

      if (headerContentRef.value) {
        resizeObserver = new ResizeObserver(() => {
          syncHeaderHeight()
        })

        resizeObserver.observe(headerContentRef.value)
      }

      if (mobileNavRef.value) {
        mobileNavResizeObserver = new ResizeObserver(() => {
          syncMobileNavHeight()
        })

        mobileNavResizeObserver.observe(mobileNavRef.value)
      }
    })

    fetchUnansweredSignals()
    intervalId = setInterval(fetchUnansweredSignals, 15_000)
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
    resizeObserver?.disconnect()
    mobileNavResizeObserver?.disconnect()
    document.documentElement.style.removeProperty('--app-header-height')
    document.documentElement.style.removeProperty('--app-mobile-nav-height')
  })
</script>

<style scoped>
.hhire-header {
  border-bottom: 1px solid #cfcfcf;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
  padding: 0;
}

.app-shell {
  width: 100%;
}

.header-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 10px 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.logo {
  height: 40px;
}

.brand-name {
  font-family: 'Junge', serif;
  font-size: clamp(16px, 2vw, 22px);
  font-weight: 400;
}

.header-center {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  flex: 1;
  min-width: 150px;
}

.header-search {
  display: flex;
  align-items: center;
  flex: 0 1 360px;
  min-width: 240px;
}

.header-search__input {
  width: 100%;
}

.nav-link {
  text-decoration: none;
  font-size: clamp(14px, 1.5vw, 16px);
  color: #000;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #555;
}

.nav-link.active {
  color: #a0eba2;
  font-weight: 500;
}

.header-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  min-width: 120px;
}

.login-link {
  font-size: clamp(14px, 1.5vw, 16px);
  color: #000;
  text-decoration: none;
}

.signup-btn,
  .create-post-btn {
    background: linear-gradient(90deg, #d3ffad 11%, #97e5ee 100%);
    color: #000;
    font-weight: 500;
    text-transform: none;
    min-width: 120px;
  }

.position-relative {
  margin-top: 12px;
  position: relative;
}

.notif-count {
  font-size: 10px;
  color: #fff;
  background-color: #ef4444;
  border-radius: 50%;
  padding: 2px 6px;
  position: absolute;
  top: -4px;
  right: -4px;
}

.mobile-nav {
  display: none;
}

@media (max-width: 768px) {
  .header-content {
    padding: 12px 16px;
    flex-wrap: nowrap;
    gap: 8px;
  }

  .header-left {
    order: 0;
    flex: 0 0 auto;
    min-width: 0;
    flex-shrink: 0;
  }

  .header-center {
    display: none;
  }

  .header-search {
    order: 1;
    flex: 1 1 auto;
    min-width: 0;
    max-width: 240px;
    margin-top: 0;
  }

  .header-right {
    order: 2;
    flex: 0 0 auto;
    min-width: 0;
    justify-content: flex-end;
    gap: 6px;
  }

  .header-search__input {
    width: 100%;
    min-width: 0;
  }

  .create-post-btn {
    display: none;
  }

  .create-post-btn {
    min-width: 0;
    padding-inline: 12px;
  }

  .brand-name {
    font-size: 16px;
  }

  .mobile-nav {
    position: fixed;
    inset: auto 0 0;
    z-index: 1100;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: 8px;
    padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
    background: #ffffff;
    border-top: 1px solid rgba(207, 207, 207, 0.9);
    box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.08);
  }

  .mobile-nav__link {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 46px;
    border-radius: 14px;
    padding: 10px 12px;
    text-decoration: none;
    color: #111827;
    background: #f7fafc;
    border: 1px solid transparent;
    opacity: 1;
    transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
  }

  .mobile-nav__link--create-post {
    background: transparent;
    border-color: rgba(148, 163, 184, 0.28);
    color: #334155;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.65);
  }

  .mobile-nav__link--filters {
    background: linear-gradient(90deg, #7dd3fc 0%, #faf49fc2 100%);
    color: #0f172a;
    font-weight: 700;
  }

  /* .mobile-nav__link:hover {
    transform: translateY(-1px);
    background: #eefcf0;
  } */

  .mobile-nav__link:focus-visible {
    outline: 2px solid #111827;
    outline-offset: 2px;
  }

  .mobile-nav__link--active {
    background: linear-gradient(135deg, #9BFF43, #31EAFF);
    border-color: rgba(255, 255, 255, 0.65);
    color: #0f172a;
    font-weight: 700;
  }

  .mobile-nav__label {
    font-size: 12px;
    font-weight: 600;
    line-height: 1.1;
    text-align: center;
    white-space: nowrap;
  }

  .header-left {
    order: 0;
  }
}

</style>
