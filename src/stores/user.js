import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { login as loginApi } from '@/api/auth'
import { useMenuStore } from '@/stores/menu'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')
  const profile = ref(null)
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

  return { token, username, profile, displayName, avatar, login, logout, setProfile }
})
