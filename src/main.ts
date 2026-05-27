/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins, then mounts the app.
 */

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from '@/app/App.vue'
import { registerPlugins } from '@/app/providers'
import { useAuthStore } from '@/features/auth/model/auth.store'
import 'unfonts.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)

const authStore = useAuthStore(pinia)
authStore.loadUserFromStorage()

registerPlugins(app)

app.mount('#app')
