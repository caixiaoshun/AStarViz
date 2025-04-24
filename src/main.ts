import { createApp } from 'vue'
import './reset.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.min.mjs'

const app = createApp(App)
app.use(ElementPlus, {
    locale: zhCn,
})
app.mount('#app')
