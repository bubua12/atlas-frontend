<template>
  <a-layout-header style="background:#fff;padding:0 16px;height:50px;line-height:50px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 1px 4px rgba(0,21,41,0.08)">
    <span>{{ route.meta.title }}</span>
    <a-dropdown>
      <span style="cursor:pointer"><UserOutlined style="margin-right:4px" />{{ userStore.username }}</span>
      <template #overlay>
        <a-menu @click="handleLogout">
          <a-menu-item key="logout">退出登录</a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </a-layout-header>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { logout } from '@/api/auth'
import { UserOutlined } from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

function handleLogout() {
  logout().finally(() => {
    userStore.logout()
    router.push('/login')
  })
}
</script>
