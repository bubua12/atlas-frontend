<template>
  <div class="page-shell">
    <div class="dashboard-grid">
      <a-card v-for="item in cards" :key="item.title" class="page-panel stat-card" :bordered="false">
        <div class="stat-card-body">
          <div class="stat-icon" :style="{ color: item.color, background: item.background }">
            <component :is="item.icon" />
          </div>
          <a-statistic :title="item.title" :value="item.value" :value-style="{ color: item.color }" />
        </div>
      </a-card>
    </div>
    <a-card class="page-panel" :bordered="false">
      <div class="welcome-panel">
        <div>
          <h2 class="page-title">欢迎使用 Atlas 管理系统</h2>
          <div class="page-subtitle">当前用户：{{ userStore.username }}</div>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { ApartmentOutlined, MenuOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons-vue'

const userStore = useUserStore()
const cards = [
  { title: '用户数', value: '--', color: '#4f8cff', background: 'rgba(79, 140, 255, 0.14)', icon: UserOutlined },
  { title: '角色数', value: '--', color: '#63d685', background: 'rgba(99, 214, 133, 0.14)', icon: TeamOutlined },
  { title: '菜单数', value: '--', color: '#f6b74b', background: 'rgba(246, 183, 75, 0.16)', icon: MenuOutlined },
  { title: '部门数', value: '--', color: '#ff7875', background: 'rgba(255, 120, 117, 0.14)', icon: ApartmentOutlined }
]
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card-body {
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 8px;
  font-size: 22px;
}

.welcome-panel {
  min-height: 120px;
  display: flex;
  align-items: center;
}

@media (max-width: 1100px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
