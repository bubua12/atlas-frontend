import {createMemoryHistory, createRouter} from 'vue-router'

// fixme 路由、路由器的区别与应用
// fixme 路由守卫？

import Home from '@/views/home/Home.vue'
import Login from "@/views/login/Login.vue";

const routes = [
    {path: '/home', component: Home},
    {path: '/login', component: Login},
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router