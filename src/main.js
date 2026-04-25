/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { useAuthStore } from '@/features/auth/model/auth.store.js'
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Styles
import 'unfonts.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)

const authStore = useAuthStore(pinia)
authStore.loadUserFromStorage()

registerPlugins(app)

app.mount('#app')
