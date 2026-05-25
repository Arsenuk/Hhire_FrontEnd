import type { App } from 'vue'
import vuetify from '@/app/providers/vuetify'
import router from '@/app/router'

export function registerPlugins (app: App) {
  app
    .use(vuetify)
    .use(router)
}
