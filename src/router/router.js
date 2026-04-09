import {createRouter, createWebHistory} from 'vue-router'

// fixme 路由、路由器的区别与应用
// fixme 路由守卫？

import Home from '@/views/home/Home.vue'
import About from "@/views/about/About.vue";
import Login from "@/views/login/Login.vue";

const routes = [
    {path: '/home', component: Home, meta: {requiresAuth: true}},
    {path: '/about', component: About, meta: {requiresAuth: true}},
    {path: '/login', component: Login},
    {path: '/', redirect: '/home'}
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// 路由守卫
router.beforeEach((to, from) => {
    // to：你要去哪里
    // from：你从哪里来
    // next：保安手里的遥控器，按了门才开
    console.log('to(你要去哪里): ', to)
    console.log('from(你从哪里来): ', from)

    const token = localStorage.getItem("token");

    console.log('token => ', token)

    // 是否是去登录页面
    // const isLoginPage = to.path === "/login";
    //
    // const requiresAuth = to.matched.some(route => route.meta.requiresAuth);
    //
    // if (requiresAuth && !token) {
    //     return "/login";
    // }
    //
    // if (isLoginPage && token) {
    //     return "/home";
    // }
})

export default router
