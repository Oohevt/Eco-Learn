import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/main.css'
import { useAuthStore } from './stores/auth'
import { useChapterStore } from './stores/chapter'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化认证状态
const authStore = useAuthStore()
authStore.init()

// 初始化章节数据
const chapterStore = useChapterStore()
chapterStore.initialize()

app.mount('#app')
