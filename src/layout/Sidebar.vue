<template>
  <a-layout-sider :width="220" theme="dark" class="app-sider">
    <div class="brand">
      <div class="brand-mark">A</div>
      <div>
        <div class="brand-name">Atlas</div>
        <div class="brand-subtitle">管理控制台</div>
      </div>
    </div>
    <a-menu theme="dark" :selected-keys="[route.path]" mode="inline" class="side-menu" @click="({ key }) => router.push(key)">
      <a-menu-item key="/dashboard">
        <template #icon><HomeOutlined /></template>
        首页
      </a-menu-item>
      <a-sub-menu key="system">
        <template #icon><SettingOutlined /></template>
        <template #title>系统管理</template>
        <a-menu-item key="/system/user"><template #icon><UserOutlined /></template>用户管理</a-menu-item>
        <a-menu-item key="/system/role"><template #icon><TeamOutlined /></template>角色管理</a-menu-item>
        <a-menu-item key="/system/menu"><template #icon><MenuOutlined /></template>菜单管理</a-menu-item>
        <a-menu-item key="/system/dept"><template #icon><ApartmentOutlined /></template>部门管理</a-menu-item>
        <a-menu-item key="/system/dict"><template #icon><BookOutlined /></template>字典管理</a-menu-item>
        <a-menu-item key="/system/config"><template #icon><ToolOutlined /></template>系统设置</a-menu-item>
      </a-sub-menu>
      <a-sub-menu key="monitor">
        <template #icon><DesktopOutlined /></template>
        <template #title>系统监控</template>
        <a-menu-item key="/monitor/server"><template #icon><CloudServerOutlined /></template>服务监控</a-menu-item>
        <a-menu-item key="/monitor/service"><template #icon><ClusterOutlined /></template>服务状态</a-menu-item>
        <a-menu-item key="/monitor/online"><template #icon><UsergroupAddOutlined /></template>在线用户</a-menu-item>
        <a-menu-item key="/monitor/operlog"><template #icon><FileTextOutlined /></template>操作日志</a-menu-item>
      </a-sub-menu>
    </a-menu>
  </a-layout-sider>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import {
  ApartmentOutlined,
  BookOutlined,
  ClusterOutlined,
  CloudServerOutlined,
  DesktopOutlined,
  FileTextOutlined,
  HomeOutlined,
  MenuOutlined,
  SettingOutlined,
  TeamOutlined,
  ToolOutlined,
  UsergroupAddOutlined,
  UserOutlined
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
</script>

<style scoped>
.app-sider {
  position: fixed !important;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 30;
  height: 100vh;
  overflow-y: auto;
  box-shadow: 1px 0 8px rgba(15, 23, 42, 0.12);
  background: var(--app-sidebar) !important;
}

.app-sider :deep(.ant-layout-sider-children) {
  display: flex;
  min-height: 100%;
  flex-direction: column;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 56px;
  padding: 0 18px;
  color: #fff;
  background: var(--app-sidebar-brand);
}

.brand-mark {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 8px;
  background: #4f8cff;
  font-weight: 700;
}

.brand-name {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.1;
}

.brand-subtitle {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 12px;
  line-height: 1.1;
}

.side-menu {
  flex: 1;
  border-inline-end: 0;
  background: var(--app-sidebar);
}
</style>
