/**
 * app/providers/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from './vuetify'
import router from '@/app/router'

export function registerPlugins (app) {
  app
    .use(vuetify)
    .use(router)
}
