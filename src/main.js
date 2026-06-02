import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { hasPermiDirective } from './directive/permission'
import './styles/index.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(Antd)
app.directive('has-permi', hasPermiDirective)
app.mount('#app')
