/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'
import { useAuthStore } from '@/stores/auth'

// Composables
import { createPinia } from 'pinia'
import { createApp } from 'vue'

// Styles
import 'unfonts.css'

import 'vuetify/styles' 

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)

const authStore = useAuthStore(pinia)
authStore.loadUserFromStorage()

registerPlugins(app)

app.mount('#app')
