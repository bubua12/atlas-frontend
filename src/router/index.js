import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', component: () => import('@/views/login/Login.vue') },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', component: () => import('@/views/dashboard/Dashboard.vue'), meta: { title: '首页' } },
      { path: 'profile', component: () => import('@/views/user/Profile.vue'), meta: { title: '个人中心' } },
      { path: 'system/user', component: () => import('@/views/system/User.vue'), meta: { title: '用户管理' } },
      { path: 'system/role', component: () => import('@/views/system/Role.vue'), meta: { title: '角色管理' } },
      { path: 'system/menu', component: () => import('@/views/system/Menu.vue'), meta: { title: '菜单管理' } },
      { path: 'system/dept', component: () => import('@/views/system/Dept.vue'), meta: { title: '部门管理' } },
      { path: 'system/dict', component: () => import('@/views/system/Dict.vue'), meta: { title: '字典管理' } },
      { path: 'system/config', component: () => import('@/views/system/Config.vue'), meta: { title: '系统设置' } },
      { path: 'monitor/server', component: () => import('@/views/monitor/Server.vue'), meta: { title: '服务监控' } },
      { path: 'monitor/online', component: () => import('@/views/monitor/Online.vue'), meta: { title: '在线用户' } },
      { path: 'monitor/service', component: () => import('@/views/monitor/Service.vue'), meta: { title: '服务状态' } },
      { path: 'monitor/operlog', component: () => import('@/views/monitor/OperLog.vue'), meta: { title: '操作日志' } },
      { path: 'message', component: () => import('@/views/message/MessageCenter.vue'), meta: { title: '消息中心' } },
      { path: 'system/announce', component: () => import('@/views/system/Announce.vue'), meta: { title: '公告管理' } }
    ]
  }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to, from, next) => {
  if (to.path !== '/login' && !localStorage.getItem('token')) next('/login')
  else next()
})

export default router
