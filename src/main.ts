/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins, then mounts the app.
 */

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from '@/app/App.vue'
import { initAuth } from '@/app/bootstrap/initAuth'
import { registerPlugins } from '@/app/providers'
import 'unfonts.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)

await initAuth(pinia)

registerPlugins(app)

app.mount('#app')
