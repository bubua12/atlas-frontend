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

  // 动态路由尚未加载 → 拉取菜单并注册
  const menuStore = useMenuStore()
  const userStore = useUserStore()
  if (!menuStore.routesLoaded) {
    try {
      const routes = await menuStore.generateRoutes()
      // 同时加载权限列表
      await userStore.loadPermissions()
      routes.forEach(route => router.addRoute('/', route))
      // 添加 404 兜底路由（必须在所有动态路由之后）
      router.addRoute({ path: '/:pathMatch(.*)*', name: 'NotFound', redirect: '/404' })
      // 重新导航，确保新路由生效
      return next({ ...to, replace: true })
    } catch (e) {
      console.error('[router] 加载动态菜单失败', e)
      menuStore.resetRoutes()
      userStore.permissions = []
      return next('/login')
    }
  }

  next()
})

export default router
