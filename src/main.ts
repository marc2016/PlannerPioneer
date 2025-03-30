import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css' 
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { mdiFolder } from '@mdi/js'

import { createPinia } from 'pinia'

import { createApp } from "vue";
import App from "./App.vue";
import router from './router/index.ts';
import { initSettingsStore } from './store/index.ts';

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases: {
            ...aliases,
            folder: mdiFolder,
          },
        sets: {
          mdi,
        },
    }
  })

const pinia = createPinia()
const app = createApp(App);
app.use(pinia)
app.use(router)
app.use(vuetify)

app.mount("#app");

await initSettingsStore();
  