<template>
  <a-layout-sider :width="220" theme="dark" class="app-sider">
    <div class="brand">
      <div class="brand-mark">A</div>
      <div>
        <div class="brand-name">Atlas</div>
        <div class="brand-subtitle">管理控制台</div>
      </div>
    </div>
    <a-menu
      theme="dark"
      :selected-keys="selectedKeys"
      :open-keys="openKeys"
      mode="inline"
      class="side-menu"
      @click="handleMenuClick"
      @openChange="onOpenChange"
    >
      <!-- 首页始终显示 -->
      <a-menu-item key="/dashboard">
        <template #icon><HomeOutlined /></template>
        首页
      </a-menu-item>
      <!-- 动态菜单 -->
      <template v-for="menu in visibleMenus" :key="menu.path">
        <SubMenuRecursive :menu="menu" :parent-path="''" />
      </template>
    </a-menu>
  </a-layout-sider>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HomeOutlined } from '@ant-design/icons-vue'
import { useMenuStore } from '@/stores/menu'
import SubMenuRecursive from './SubMenuRecursive.vue'

const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()

const visibleMenus = computed(() => (menuStore.menus || []).filter(m => !m.hidden))

// 选中的菜单项：匹配当前路由路径
const selectedKeys = computed(() => [route.path])

// 自动展开当前路由所在的子菜单
const openKeys = ref([])

// 根据路由路径计算应该展开的 key
function computeOpenKeys(path) {
  const parts = path.split('/').filter(Boolean)
  const keys = []
  // /system/user → ['/system']
  // /monitor/server → ['/monitor']
  if (parts.length > 1) {
    keys.push(`/${parts[0]}`)
  }
  return keys
}

// 路由变化时自动展开对应子菜单
import { watch } from 'vue'
watch(() => route.path, (path) => {
  openKeys.value = computeOpenKeys(path)
}, { immediate: true })

function handleMenuClick({ key }) {
  router.push(key)
}

function onOpenChange(keys) {
  openKeys.value = keys
}
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
  background: #1f4fbf;
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
