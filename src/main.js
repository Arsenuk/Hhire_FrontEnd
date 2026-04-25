/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { registerPlugins } from '@/plugins'
import { useAuthStore } from '@/stores/auth'

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
