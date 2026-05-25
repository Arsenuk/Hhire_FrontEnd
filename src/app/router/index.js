/**
 * app/router/index.js
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { useAuthStore } from '@/features/auth/model/auth.store'
import { canAccessAdminPanel } from '@/shared/lib/auth/adminPanelAccess'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.beforeEach(async to => {
  if (!to.path.toLowerCase().startsWith('/adminpanel')) {
    return true
  }

  const authStore = useAuthStore()

  if (authStore.accessToken && !authStore.user) {
    try {
      await authStore.fetchMe()
    } catch (error) {
      console.error('Failed to verify admin panel access', error)
    }
  }

  if (!authStore.isLoggedIn) {
    return '/login'
  }

  if (!canAccessAdminPanel(authStore.user)) {
    return '/feed'
  }

  return true
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
