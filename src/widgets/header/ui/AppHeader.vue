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

            <RouterLink to="/createpost">
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
            <RouterLink class="login-link" to="/login">Log In</RouterLink>
            <RouterLink to="/signup">
              <v-btn class="signup-btn" elevation="0" rounded>Sign Up</v-btn>
            </RouterLink>
          </template>
        </div>
      </div>
    </v-app-bar>

    <nav v-if="navLinks.length > 1" class="mobile-nav" aria-label="Primary navigation">
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
  const headerContentRef = ref<HTMLElement | null>(null)
  const headerHeight = ref(88)

  const isLoggedIn = computed(() => authStore.isLoggedIn)
  const user = computed(() => authStore.user)
  const hasAdminPanelAccess = computed(() => canAccessAdminPanel(user.value))

  const navLinks = computed<NavLink[]>(() => {
    if (isLoggedIn.value) {
      const links = [
        { label: 'Feed', to: '/feed' },
        { label: 'Contacts', to: '/contacts' },
      ]

      if (hasAdminPanelAccess.value) {
        links.push({ label: 'Admin Panel', to: '/AdminPanel' })
      }

      return links
    }

    return [
      { label: 'Get Started', to: '/' },
      { label: 'Feed', to: '/feed' },
    ]
  })

  const mobileNavItems = computed<MobileNavItem[]>(() => {
    const items: MobileNavItem[] = [
      { label: 'Feed', to: '/feed', icon: 'mdi-home-variant-outline' },
      { label: 'Contacts', to: '/contacts', icon: 'mdi-account-group-outline' },
    ]

    if (isLoggedIn.value) {
      items.push({
        label: 'Create Post',
        to: '/createpost',
        icon: 'mdi-plus-circle-outline',
        variant: 'primary',
      })

      if (route.path.toLowerCase() === '/feed') {
        items.push({
          label: 'Filters',
          to: '/feed',
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

  const unansweredSignals = ref(0)

  let resizeObserver: ResizeObserver | null = null

  function syncHeaderHeight () {
    const height = headerContentRef.value?.getBoundingClientRect().height

    if (!height) return

    headerHeight.value = Math.ceil(height)
    document.documentElement.style.setProperty('--app-header-height', `${headerHeight.value}px`)
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

      if (headerContentRef.value) {
        resizeObserver = new ResizeObserver(() => {
          syncHeaderHeight()
        })

        resizeObserver.observe(headerContentRef.value)
      }
    })

    fetchUnansweredSignals()
    intervalId = setInterval(fetchUnansweredSignals, 15_000)
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
    resizeObserver?.disconnect()
    document.documentElement.style.removeProperty('--app-header-height')
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
  }

  .header-left {
    min-width: 0;
    flex-shrink: 0;
  }

  .header-center {
    display: none;
  }

  .header-right {
    min-width: 0;
    flex: 1;
    justify-content: flex-end;
    gap: 6px;
  }

  .create-post-btn {
    display: none;
  }

  .create-post-btn {
    min-width: 0;
    padding-inline: 12px;
  }

  .brand-name {
    font-size: 18px;
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

  .header-center {
    order: 3;
    margin-top: 5px;
  }

  .header-right {
    order: 2;
    margin-top: 5px;
  }
}

</style>
