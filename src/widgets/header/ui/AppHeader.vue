<template>
  <v-app-bar class="hhire-header" flat height="auto">
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
              <v-avatar size="36">
                <v-img
                  :alt="user?.name || 'Avatar'"
                  :lazy-src="defaultAvatar"
                  :src="getAvatarUrl(user?.avatar)"
                />
              </v-avatar>
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
  </v-app-bar>
</template>

<script setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useAuthStore } from '@/features/auth/model/auth.store.js'
  import { api } from '@/shared/api/api.js'
  import defaultAvatar from '@/shared/assets/default-avatar.png'
  import { getAvatarUrl } from '@/shared/lib/media/getAvatarUrl.js'

  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()

  const isLoggedIn = computed(() => authStore.isLoggedIn)
  const user = computed(() => authStore.user)

  const navLinks = computed(() =>
    isLoggedIn.value
      ? [
        { label: 'Feed', to: '/feed' },
        { label: 'Contacts', to: '/contacts' },
      ]
      : [
        { label: 'Get Started', to: '/' },
        { label: 'Feed', to: '/feed' },
      ],
  )

  const isActive = path => route.path === path

  async function logout() {
    await authStore.logout()
    router.push('/')
  }

  const unansweredSignals = ref(0)

  async function fetchUnansweredSignals() {
    if (!isLoggedIn.value) return
    try {
      const res = await api.get('/signals/conversations/inbox')
      unansweredSignals.value = res.data.signals.length
    } catch (error) {
      console.error('Failed to fetch signals', error)
    }
  }

  let intervalId = null

  onMounted(() => {
    fetchUnansweredSignals()
    intervalId = setInterval(fetchUnansweredSignals, 15_000)
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })
</script>

<style scoped>
.hhire-header {
  border-bottom: 1px solid #cfcfcf;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
  padding: 10px 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
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

@media (max-width: 768px) {
  .header-left,
  .header-center,
  .header-right {
    justify-content: center;
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
