import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getRouters } from '@/api/menu'
import router from '@/router'

// 自动扫描所有页面组件，key 形如 '/src/views/system/User.vue'
const viewModules = import.meta.glob('@/views/**/*.vue')

export const useMenuStore = defineStore('menu', () => {
  const menus = ref([])           // 菜单树（给 Sidebar 渲染用）
  const dynamicRoutes = ref([])   // 动态注册的路由列表（供 removeRoute 用）
  const routesLoaded = ref(false) // 动态路由是否已加载
  const loading = ref(false)      // 是否正在加载中（防止并发重复请求）

  /**
   * 拉取菜单 → 转换为 vue-router 路由 → 返回路由数组
   */
  async function generateRoutes() {
    if (loading.value) return []  // 已在加载中，跳过
    loading.value = true
    try {
      const data = await getRouters()
      menus.value = data || []
      const routes = convertToRoutes(data || [])
      dynamicRoutes.value = routes
      routesLoaded.value = true
      return routes
    } finally {
      loading.value = false
    }
  }

  /**
   * 清理动态路由并重置状态（登出时调用）
   */
  function resetRoutes() {
    dynamicRoutes.value.forEach(route => {
      if (route.name) router.removeRoute(route.name)
    })
    router.removeRoute('NotFound')
    menus.value = []
    dynamicRoutes.value = []
    routesLoaded.value = false
    loading.value = false
  }

  return { menus, dynamicRoutes, routesLoaded, loading, generateRoutes, resetRoutes }
})

/**
 * 将后端菜单树转换为 vue-router 路由配置
 */
function convertToRoutes(menuTree) {
  return menuTree.map(menu => {
    const route = {
      name: generateRouteName(menu.path),
      path: menu.path,
      component: resolveComponent(menu.component),
      meta: { title: menu.menuName, icon: menu.icon },
      hidden: menu.visible === 1
    }

    if (menu.children?.length) {
      // 目录级：递归处理子路由
      route.children = convertToRoutes(menu.children)
      // 如果目录级只有一个子菜单且自身没有 component，可以设置 redirect
      if (route.children.length > 0) {
        route.redirect = route.children[0].path
      }
    }

    return route
  })
}

/**
 * 根据 component 字符串解析为 Vue 组件
 * - "Layout" → Layout 组件
 * - "system/User" → () => import('@/views/system/User.vue')
 */
function resolveComponent(component) {
  if (!component) return null
  if (component === 'Layout') {
    return () => import('@/layout/index.vue')
  }
  // 拼接完整路径并在 viewModules 中查找
  const fullPath = `/src/views/${component}.vue`
  const loader = viewModules[fullPath]
  if (loader) return loader
  // 兜底：尝试加 /index.vue（有些页面可能是目录形式）
  const indexPath = `/src/views/${component}/index.vue`
  const indexLoader = viewModules[indexPath]
  if (indexLoader) return indexLoader
  console.warn(`[menuStore] 未找到组件: ${component}，尝试路径: ${fullPath}`)
  return null
}

/**
 * 生成路由 name（用于 removeRoute）
 * "/system" → "system", "user" → "user", "/system/user" → "system-user"
 */
function generateRouteName(path) {
  return path.replace(/^\//, '').replace(/\//g, '-') || 'root'
}
