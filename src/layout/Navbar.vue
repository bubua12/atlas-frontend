<template>
  <a-layout-header :style="headerStyle" class="app-header">
    <div>
      <div class="header-title">{{ route.meta.title }}</div>
      <div class="header-subtitle">Atlas Enterprise Platform</div>
    </div>
    <div class="header-actions">
      <a-button shape="circle" @click="themeStore.toggle()">
        <template #icon>
          <BulbOutlined v-if="!themeStore.isDark" />
          <BulbFilled v-else />
        </template>
      </a-button>
      <a-dropdown>
        <a-button class="user-button">
          <template #icon><UserOutlined /></template>
          {{ userStore.username }}
        </a-button>
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
  background: themeStore.isDark ? 'var(--app-panel)' : '#fff',
  padding: '0 20px',
  height: '56px',
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

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-title {
  color: var(--app-text);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
}

.header-subtitle {
  margin-top: 2px;
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.2;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-button {
  min-width: 96px;
}

:global(html.dark) .app-header {
  border-bottom: 1px solid var(--app-border);
  box-shadow: none;
}
</style>
