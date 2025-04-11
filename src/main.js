import '@/assets/main.css'
import 'element-plus/dist/index.css'
import 'default-passive-events'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import locale from 'element-plus/dist/locale/zh-cn'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import router from '@/router'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()
const persist = createPersistedState()

pinia.use(persist)

app.use(router)
app.use(ElementPlus, { locale })
app.use(pinia)
app.mount('#app')
