import {createRouter, createWebHistory} from 'vue-router'

import MainLayout from "@/layout/MainLayout.vue";
import Home from '@/views/home/Home.vue'
import About from "@/views/about/About.vue";
import Login from "@/views/login/Login.vue";
import User from "@/views/user/User.vue";
import Role from "@/views/role/Role.vue";

// fixme 目前这里是手动进行配置
const routes = [
    {
        path: '/',
        component: MainLayout,
        meta: {requiresAuth: true, title: "首页"},
        children: [
            {path: 'home', component: Home, meta: {title: "首页"}},
            {path: 'about', component: About, meta: {title: "数据看板"}},
            {path: 'user', component: User, meta: {title: "用户管理"}},
            {path: 'role', component: Role, meta: {title: "角色管理"}},
            {path: '', redirect: '/home'}
        ]
    },
    {path: '/login', component: Login, meta: {title: "登录"}},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// 路由守卫
router.beforeEach((to) => {
    const token = localStorage.getItem("token");
    const isLoginPage = to.path === "/login";
    const requiresAuth = to.matched.some(route => route.meta.requiresAuth);

    if (requiresAuth && !token) {
        return "/login";
    }

    if (isLoginPage && token) {
        return "/home";
    }
})

export default router