<template>
  <a-layout-header :style="headerStyle" class="app-header">
    <div>
      <div class="header-title">{{ route.meta.title }}</div>
      <div class="header-subtitle">Atlas Enterprise Platform</div>
    </div>
    <div class="header-actions">
      <MessageBell />
      <a-popover v-model:open="profileOpen" trigger="click" placement="bottomRight" overlay-class-name="profile-popover">
        <button class="avatar-button" type="button">
          <a-avatar :src="userStore.avatar" :size="34">{{ avatarText }}</a-avatar>
        </button>
        <template #content>
          <div class="profile-card">
            <div class="profile-head">
              <a-avatar :src="userStore.avatar" :size="44">{{ avatarText }}</a-avatar>
              <div>
                <div class="profile-name">{{ userStore.displayName || '-' }}</div>
                <div class="profile-username">{{ profile?.username || userStore.username }}</div>
              </div>
            </div>
            <div class="profile-info">
              <div>
                <span>姓名</span>
                <strong>{{ profile?.nickname || '-' }}</strong>
              </div>
              <div>
                <span>手机号</span>
                <strong>{{ profile?.phone || '-' }}</strong>
              </div>
              <div>
                <span>邮箱</span>
                <strong>{{ profile?.email || '-' }}</strong>
              </div>
              <div>
                <span>部门</span>
                <strong>{{ profile?.deptName || '暂无部门' }}</strong>
              </div>
            </div>
            <div class="profile-actions">
              <a-button type="link" @click="goProfile">
                <template #icon><IdcardOutlined /></template>
                个人中心
              </a-button>
              <a-button type="link" danger @click="handleLogout">
                <template #icon><LogoutOutlined /></template>
                退出登录
              </a-button>
            </div>
          </div>
        </template>
      </a-popover>
    </div>
  </a-layout-header>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { logout } from '@/api/auth'
import { getProfile } from '@/api/user'
import { IdcardOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import MessageBell from '@/components/MessageBell.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const profileOpen = ref(false)
const profile = computed(() => userStore.profile)
const avatarText = computed(() => (userStore.displayName || userStore.username || 'A').slice(0, 1).toUpperCase())

const headerStyle = computed(() => ({
  background: '#fff',
  padding: '0 20px',
  height: '56px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
}))

import { useMessageStore } from '@/stores/message'

const messageStore = useMessageStore()

function handleLogout() {
  logout().finally(() => {
    messageStore.disconnect()
    userStore.logout()
    router.push('/login')
  })
}

function goProfile() {
  profileOpen.value = false
  router.push('/profile')
}

async function loadProfile() {
  try {
    const data = await getProfile()
    userStore.setProfile(data)
  } catch {}
}

onMounted(loadProfile)
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

.avatar-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 1px solid var(--app-border-strong);
  border-radius: 50%;
  background: var(--app-panel);
  cursor: pointer;
}

.avatar-button:hover {
  border-color: #1f4fbf;
}

.profile-card {
  width: 280px;
}

.profile-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--app-border);
}

.profile-name {
  color: var(--app-text);
  font-size: 15px;
  font-weight: 700;
}

.profile-username {
  margin-top: 2px;
  color: var(--app-text-muted);
  font-size: 12px;
}

.profile-info {
  display: grid;
  gap: 10px;
  padding: 14px 0;
  border-bottom: 1px solid var(--app-border);
}

.profile-info div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.profile-info span {
  color: var(--app-text-muted);
}

.profile-info strong {
  min-width: 0;
  color: var(--app-text-secondary);
  font-weight: 600;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-actions {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
}

.profile-actions .ant-btn {
  padding-inline: 0;
}

:global(.profile-popover .ant-popover-inner) {
  padding: 14px 16px 10px;
}
</style>
