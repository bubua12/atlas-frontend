import { createRouter, createWebHistory } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { useUserStore } from '@/stores/user'

const staticRoutes = [
  { path: '/login', component: () => import('@/views/login/Login.vue') },
  { path: '/404', name: 'NotFoundPage', component: () => import('@/views/error/404.vue') },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/dashboard/Dashboard.vue'), meta: { title: '首页' } },
      { path: 'profile', name: 'Profile', component: () => import('@/views/user/Profile.vue'), meta: { title: '个人中心' } }
    ]
  }
]

const router = createRouter({ history: createWebHistory(), routes: staticRoutes })

const whiteList = ['/login']

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')

  // 未登录
  if (!token) {
    return whiteList.includes(to.path) ? next() : next('/login')
  }

  // 已登录访问登录页 → 重定向首页
  if (to.path === '/login') return next('/')

  // 动态路由已加载 → 直接放行
  const menuStore = useMenuStore()
  if (menuStore.routesLoaded) return next()

  // 正在加载中 → 直接放行（等加载完成后页面会自动刷新）
  if (menuStore.loading) return next()

  // 动态路由尚未加载 → 拉取菜单并注册
  const userStore = useUserStore()
  try {
    const routes = await menuStore.generateRoutes()
    await userStore.loadPermissions()
    routes.forEach(route => router.addRoute('/', route))
    router.addRoute({ path: '/:pathMatch(.*)*', name: 'NotFound', redirect: '/404' })
    return next({ ...to, replace: true })
  } catch (e) {
    console.error('[router] 加载动态菜单失败', e)
    // 清除登录态，防止无限重试（有 token → 跳 / → 又拉菜单 → 又失败 → 循环）
    userStore.logout()
    return next('/login')
  }
})

export default router
