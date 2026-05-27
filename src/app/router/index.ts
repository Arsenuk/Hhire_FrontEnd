/**
 * app/router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`.
 */

import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { useAuthStore } from '@/features/auth/model/auth.store'
import { canAccessAdminPanel } from '@/shared/lib/auth/adminPanelAccess'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.onError((error: unknown, to: RouteLocationNormalized) => {
  const message = error instanceof Error ? error.message : ''

  if (message.includes('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', error)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(error)
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
