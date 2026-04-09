import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' // fixme Element Plus 的全局样式文件也要手动引入 官网漏看了？
import App from './App.vue'
import router from './router/router.js' // fixme 这里写index.js就可以不用写到具体的名称了

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
