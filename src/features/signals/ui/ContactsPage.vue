<template>
  <v-container class="contacts-page">
    <div class="contacts-mobile-header">
      <div class="contacts-mobile-header__copy">
        <p class="contacts-kicker">Contacts</p>
        <h1 class="contacts-title">Manage your connections</h1>
      </div>

      <div ref="menuTriggerRef" class="contacts-mobile-header__trigger">
        <v-btn
          class="contacts-mobile-trigger"
          icon
          variant="tonal"
          @click="mobileMenuOpen = true"
        >
          <v-icon icon="mdi-menu" />
        </v-btn>
      </div>
    </div>

    <v-row dense>
      <v-col cols="12" md="3" class="contacts-sidebar-col">
        <div class="sticky-sidebar">
          <v-card class="sidebar-card">
            <div class="sidebar-title">
              Contacts
            </div>

            <v-list class="nav-list" nav>
              <v-list-item
                v-for="tab in tabs"
                :key="tab.key"
                class="nav-item"
                :active="currentTab === tab.key"
                @click="selectTab(tab.key)"
              >
                <v-list-item-title class="nav-title">
                  {{ tab.label }}
                </v-list-item-title>

                <template #append>
                  <div v-if="currentTab === tab.key" class="active-dot" />
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </div>
      </v-col>

      <v-col cols="12" md="9" class="contacts-content-col">
        <v-card class="content-card">
          <component :is="currentComponent" />
        </v-card>
      </v-col>
    </v-row>

    <v-navigation-drawer
      v-model="mobileMenuOpen"
      class="contacts-mobile-drawer"
      location="left"
      temporary
      width="320"
    >
      <div class="contacts-mobile-drawer__head">
        <div>
          <p class="contacts-kicker">Contacts</p>
          <h2 class="contacts-panel-title">Navigation</h2>
        </div>

        <v-btn icon variant="text" @click="mobileMenuOpen = false">
          <v-icon icon="mdi-close" />
        </v-btn>
      </div>

      <v-list class="nav-list nav-list--mobile" nav>
        <v-list-item
          v-for="tab in tabs"
          :key="`mobile-${tab.key}`"
          class="nav-item"
          :active="currentTab === tab.key"
          @click="selectTab(tab.key)"
        >
          <v-list-item-title class="nav-title">
            {{ tab.label }}
          </v-list-item-title>

          <template #append>
            <div v-if="currentTab === tab.key" class="active-dot" />
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-btn
      v-if="showBackToTop"
      class="contacts-back-to-top"
      color="primary"
      icon
      size="large"
      elevation="8"
      @click="scrollToTop"
    >
      <v-icon icon="mdi-arrow-up" />
      <v-tooltip activator="parent" location="left">
        Back to top
      </v-tooltip>
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, type Component } from 'vue'
  import Follows from '@/features/signals/ui/Follows.vue'
  import SendSignals from '@/features/signals/ui/SendSignals.vue'
  import SuggestedUsers from '@/features/signals/ui/SuggestedUsers.vue'
  import UnrepliedSignals from '@/features/signals/ui/UnrepliedSignals.vue'

  type TabKey = 'follows' | 'suggested' | 'unreplied' | 'send'

  type TabItem = {
    key: TabKey
    label: string
    component: Component
  }

  const currentTab = ref<TabKey>('follows')
  const mobileMenuOpen = ref(false)
  const menuTriggerRef = ref<HTMLElement | null>(null)
  const showBackToTop = ref(false)

  const tabs: TabItem[] = [
    { key: 'follows', label: 'Follows', component: Follows },
    { key: 'suggested', label: 'Suggested Users', component: SuggestedUsers },
    { key: 'unreplied', label: 'Inbox', component: UnrepliedSignals },
    { key: 'send', label: 'Sent Dialogs', component: SendSignals },
  ]

  const currentComponent = computed<Component | null>(() => {
    const tab = tabs.find(item => item.key === currentTab.value)
    return tab ? tab.component : null
  })

  function selectTab (tabKey: TabKey) {
    currentTab.value = tabKey
    mobileMenuOpen.value = false
  }

  function scrollToTop () {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  let menuObserver: IntersectionObserver | null = null
  let scrollListener: (() => void) | null = null
  let resizeListener: (() => void) | null = null

  function updateBackToTopVisibility () {
    if (window.innerWidth > 768) {
      showBackToTop.value = false
      return
    }

    const trigger = menuTriggerRef.value

    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const triggerIsVisible = rect.bottom > 0 && rect.top < window.innerHeight
    showBackToTop.value = !triggerIsVisible && window.scrollY > 72
  }

  onMounted(async () => {
    await nextTick()

    if (typeof window === 'undefined') return

    updateBackToTopVisibility()

    if ('IntersectionObserver' in window && menuTriggerRef.value) {
      menuObserver = new IntersectionObserver(entries => {
        const [entry] = entries
        if (window.innerWidth > 768) {
          showBackToTop.value = false
          return
        }

        showBackToTop.value = !entry.isIntersecting && window.scrollY > 72
      }, {
        threshold: 0.01,
      })

      menuObserver.observe(menuTriggerRef.value)
    } else {
      scrollListener = () => updateBackToTopVisibility()
      window.addEventListener('scroll', scrollListener, { passive: true })
    }

    resizeListener = () => updateBackToTopVisibility()
    window.addEventListener('resize', resizeListener)
  })

  onBeforeUnmount(() => {
    menuObserver?.disconnect()

    if (scrollListener) {
      window.removeEventListener('scroll', scrollListener)
    }

    if (resizeListener) {
      window.removeEventListener('resize', resizeListener)
    }
  })
</script>

<style scoped>
.contacts-page {
  margin-top: 60px;
  background: #f4f6fb;
  min-height: 100vh;
  padding-top: 40px;
  font-family: system-ui, -apple-system, sans-serif;
}

.contacts-mobile-header {
  display: none;
}

.contacts-mobile-header__copy {
  min-width: 0;
}

.contacts-mobile-header__trigger {
  flex-shrink: 0;
}

.contacts-kicker {
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 6px;
}

.contacts-title {
  font-size: clamp(22px, 3vw, 30px);
  line-height: 1.1;
  color: #0f172a;
  margin: 0;
}

.sticky-sidebar {
  position: sticky;
  top: 80px;
}

.sidebar-card {
  border-radius: 18px;
  padding: 14px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

.sidebar-title {
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
  padding-left: 6px;
}

.nav-list {
  padding: 0;
}

.nav-list--mobile {
  padding: 0 8px 12px;
}

.nav-item {
  border-radius: 12px;
  margin: 4px 0;
  padding: 10px 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.nav-item:hover {
  background: #e3fdff;
  transform: translateX(2px);
}

.nav-item.v-list-item--active {
  background: linear-gradient(135deg, #9BFF43, #31EAFF);
  color: #ffffff;
}

.nav-item.v-list-item--active .nav-title {
  color: #ffffff;
}

.nav-title {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
}

.active-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 10px rgb(255, 255, 255);
}

.content-card {
  border-radius: 18px;
  padding: 16px;
  background: #ffffff;
  min-height: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.content-card:hover {
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.08);
}

.contacts-mobile-drawer {
  padding: 16px 12px;
}

.contacts-mobile-drawer__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 12px 8px;
}

.contacts-back-to-top {
  position: fixed;
  right: 16px;
  bottom: calc(76px + env(safe-area-inset-bottom));
  z-index: 1150;
  background: linear-gradient(135deg, #9BFF43, #31EAFF);
  color: #0f172a;
}

.contacts-back-to-top :deep(.v-icon) {
  color: #0f172a;
}

.contacts-panel-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

@media (max-width: 768px) {
  .contacts-page {
    padding-top: 20px;
  }

  .contacts-mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .contacts-sidebar-col {
    display: none;
  }

  .contacts-content-col {
    flex: 0 0 100%;
    max-width: 100%;
  }

  .content-card {
    min-height: 320px;
    padding: 12px;
  }

  .contacts-back-to-top {
    right: 12px;
    bottom: calc(88px + env(safe-area-inset-bottom));
  }
}
</style>
