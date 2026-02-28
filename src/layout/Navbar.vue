<template>
  <a-layout-header :style="headerStyle">
    <span>{{ route.meta.title }}</span>
    <div style="display:flex;align-items:center;gap:12px">
      <span style="cursor:pointer;font-size:18px" @click="themeStore.toggle()">
        <BulbOutlined v-if="!themeStore.isDark" />
        <BulbFilled v-else />
      </span>
      <a-dropdown>
        <span style="cursor:pointer"><UserOutlined style="margin-right:4px" />{{ userStore.username }}</span>
        <template #overlay>
          <a-menu @click="handleLogout">
            <a-menu-item key="logout">退出登录</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </a-layout-header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { logout } from '@/api/auth'
import { UserOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()

const headerStyle = computed(() => ({
  background: themeStore.isDark ? '#141414' : '#fff',
  padding: '0 16px',
  height: '50px',
  lineHeight: '50px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
}))

function handleLogout() {
  logout().finally(() => {
    userStore.logout()
    router.push('/login')
  })
}
</script>
