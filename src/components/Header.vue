<template>
  <v-app-bar height="auto" flat class="hhire-header">
    <!-- Ліва частина: логотип + назва -->
    <div class="header-left">
      <img src="@/assets/hhire-logo.png" alt="Hhire logo" class="logo" />
      <span class="brand-name">Hhire</span>
    </div>

    <!-- Центр: навігація -->
    <div class="header-center">
      <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" class="nav-link"
        :class="{ active: isActive(link.to) }">
        {{ link.label }}
      </RouterLink>
    </div>

    <!-- Права частина -->
    <div class="header-right">
      <template v-if="isLoggedIn">
        <!-- Notify: кількість сигналів без відповіді -->
        <v-menu offset-y>
          <template #activator="{ props }">
            <v-btn icon v-bind="props" class="position-relative">
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
          <v-btn rounded class="create-post-btn">
            Create Post
          </v-btn>
        </RouterLink>

        <v-menu offset-y>
          <template #activator="{ props }">
            <v-btn icon v-bind="props">
              <v-avatar size="36">
                <v-img :src="getAvatarUrl(user?.avatar)" lazy-src="./assets/default-avatar.png"
                  :alt="user?.name || 'Avatar'" />
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
        <RouterLink to="/login" class="login-link">Log In</RouterLink>
        <RouterLink to="/signup">
          <v-btn class="signup-btn" rounded elevation="0">Sign Up</v-btn>
        </RouterLink>
      </template>
    </div>
  </v-app-bar>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { api } from '@/api/api.js'
import defaultAvatar from '@/assets/default-avatar.png'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.user)

const getAvatarUrl = (avatar) => {
  if (!avatar) return defaultAvatar
  return avatar.startsWith('http') ? avatar : `http://localhost:3000${avatar}`
}

const navLinks = computed(() =>
  isLoggedIn.value
    ? [
        { label: 'Feed', to: '/feed' },
        { label: 'Contacts', to: '/contacts' },
      ]
    : [
        { label: 'Get Started', to: '/' },
        { label: 'Feed', to: '/feed' },
      ]
)

const isActive = path => route.path === path

async function logout() {
  try {
    await api.post('/auth/logout')
  } finally {
    authStore.user = null
    authStore.accessToken = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    router.push('/')
  }
}

// --- Notifications: кількість сигналів без відповіді ---
const unansweredSignals = ref(0)

const fetchUnansweredSignals = async () => {
  if (!isLoggedIn.value) return;

  try {
    const res = await api.get('/signals/conversations/inbox?unread=true');

    unansweredSignals.value = res.data.conversations
      .reduce((sum, conv) => sum + (conv.unread_count || 0), 0);

  } catch (err) {
    console.error('Failed to fetch signals', err);
  }
};

// --- Автооновлення кожні 15 сек ---
let intervalId = null

onMounted(() => {
  fetchUnansweredSignals()
  intervalId = setInterval(fetchUnansweredSignals, 15000)
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

/* LEFT */
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

/* CENTER */
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

/* RIGHT */
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
  background: linear-gradient(90deg, #D3FFAD 11%, #97e5ee 100%);
  color: #000;
  font-weight: 500;
  text-transform: none;
  min-width: 120px;
}

/* Notif count */
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

/* Media queries для мобільних */
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
