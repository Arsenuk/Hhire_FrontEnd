<template>
  <v-app-bar
    height="70"
    flat
    class="hhire-header"
  >
    <!-- Ліва частина: логотип + назва -->
    <div class="header-left">
      <img
        src="@/assets/hhire-logo.png"
        alt="Hhire logo"
        class="logo"
      />
      <span class="brand-name">Hhire</span>
    </div>

    <!-- Центр: навігація -->
    <div class="header-center">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="nav-link brand-name"
        :class="{ active: isActive(link.to) }"
      >
        {{ link.label }}
      </RouterLink>
    </div>

    <!-- Права частина: auth -->
    <div class="header-right brand-name">
      <RouterLink to="/login" class="login-link">
        Log In
      </RouterLink>

      <RouterLink to="/signup">
        <v-btn class="signup-btn" rounded="xl" elevation="0">
          Sign Up
        </v-btn>
      </RouterLink>
    </div>
  </v-app-bar>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const links = [
  { label: 'Get Started', to: '/' },
  { label: 'Feed', to: '/feed' },
  { label: 'Last News', to: '/last-news' },
]

const isActive = (path) => route.path === path
</script>

<style scoped>
.hhire-header {
  border-bottom: 1px solid #cfcfcf;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
  padding: 0 32px;
}

/* LEFT */
.header-left {
  padding-left: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  height: 36px;
}

.brand-name {
  font-family: 'Junge', serif;
  font-size: 22px;
  font-weight: 400;
}

/* CENTER */
.header-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 32px;
}

.nav-link {
  text-decoration: none;
  font-size: 16px;
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
    padding-right: 40px;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 20px;
}

.login-link {
  text-decoration: none;
  color: #000;
  font-size: 16px;
}

.signup-btn {
  background: linear-gradient(90deg, #D3FFAD 11%, #97e5ee 100%);
  color: #000;
  text-transform: none;
  font-weight: 500;
}
</style>
