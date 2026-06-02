import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { login as loginApi } from '@/api/auth'
import { getPermissions } from '@/api/user'
import { useMenuStore } from '@/stores/menu'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')
  const profile = ref(null)
  const permissions = ref([]) // 权限标识列表，如 ['system:user:add', ...]
  const displayName = computed(() => profile.value?.nickname || username.value || '')
  const avatar = computed(() => profile.value?.avatar || '')

  async function login(form) {
    const data = await loginApi(form)
    token.value = data.token
    username.value = form.username || form.phone || ''
    localStorage.setItem('token', data.token)
    localStorage.setItem('username', username.value)
    return data
  }

  function logout() {
    token.value = ''
    username.value = ''
    profile.value = null
    permissions.value = []
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    // 清理动态路由
    const menuStore = useMenuStore()
    menuStore.resetRoutes()
  }

  function setProfile(data) {
    profile.value = data || null
    if (data?.username) {
      username.value = data.username
      localStorage.setItem('username', data.username)
    }
  }

  /** 拉取当前用户的权限标识列表 */
  async function loadPermissions() {
    const data = await getPermissions()
    permissions.value = Array.isArray(data) ? data : []
  }

  /** 判断是否拥有某个权限 */
  function hasPermission(perm) {
    if (permissions.value.includes('*:*:*')) return true
    return permissions.value.includes(perm)
  }

  return { token, username, profile, permissions, displayName, avatar, login, logout, setProfile, loadPermissions, hasPermission }
})
