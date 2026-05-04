<template>
  <div class="navigation-tabs">
    <div class="tabs-scroll">
      <a-dropdown
        v-for="tab in tabs"
        :key="tab.path"
        :trigger="['contextmenu']"
        overlay-class-name="navigation-tab-dropdown"
      >
        <button class="nav-tab" :class="{ active: isActive(tab) }" type="button" @click="goTab(tab)">
          <HomeFilled v-if="tab.path === homePath" />
          <span>{{ tab.title }}</span>
          <CloseOutlined v-if="tab.closable" class="tab-close" @click.stop="closeTab(tab)" />
        </button>
        <template #overlay>
          <a-menu @click="({ key }) => handleCommand(key, tab)">
            <a-menu-item key="refresh">
              <template #icon><ReloadOutlined /></template>
              刷新
            </a-menu-item>
            <a-menu-item key="close" :disabled="!tab.closable">关闭当前</a-menu-item>
            <a-menu-item key="closeOthers">关闭其它</a-menu-item>
            <a-menu-item key="closeAll">关闭所有</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CloseOutlined, HomeFilled, ReloadOutlined } from '@ant-design/icons-vue'

const emit = defineEmits(['refresh'])
const route = useRoute()
const router = useRouter()
const homePath = '/dashboard'
const homeTab = { path: homePath, fullPath: homePath, title: '首页', closable: false }
const tabs = ref([homeTab])

watch(
  () => route.fullPath,
  () => addRouteTab(),
  { immediate: true }
)

function addRouteTab() {
  if (route.path === '/login') return
  const title = route.meta?.title || route.path
  const existing = tabs.value.find(tab => tab.path === route.path)
  if (existing) {
    existing.fullPath = route.fullPath
    existing.title = title
    return
  }
  tabs.value.push({
    path: route.path,
    fullPath: route.fullPath,
    title,
    closable: route.path !== homePath
  })
}

function isActive(tab) {
  return tab.path === route.path
}

function goTab(tab) {
  if (!isActive(tab)) router.push(tab.fullPath || tab.path)
}

function closeTab(tab) {
  if (!tab.closable) return
  const index = tabs.value.findIndex(item => item.path === tab.path)
  tabs.value = tabs.value.filter(item => item.path !== tab.path)
  if (isActive(tab)) {
    const next = tabs.value[index] || tabs.value[index - 1] || homeTab
    router.push(next.fullPath || next.path)
  }
}

function handleCommand(key, tab) {
  if (key === 'refresh') {
    refreshTab(tab)
    return
  }
  if (key === 'closeOthers') {
    closeOthers(tab)
    return
  }
  if (key === 'close') {
    closeTab(tab)
    return
  }
  closeAll()
}

function refreshTab(tab) {
  if (isActive(tab)) {
    emit('refresh')
    return
  }
  router.push(tab.fullPath || tab.path).then(() => emit('refresh'))
}

function closeOthers(tab) {
  tabs.value = [homeTab, tab].filter((item, index, list) => list.findIndex(t => t.path === item.path) === index)
  if (!isActive(tab)) router.push(tab.fullPath || tab.path)
}

function closeAll() {
  tabs.value = [homeTab]
  if (route.path !== homePath) router.push(homePath)
}
</script>

<style scoped>
.navigation-tabs {
  display: flex;
  align-items: flex-end;
  height: 40px;
  padding: 0 18px;
  border-bottom: 1px solid var(--app-border);
  background: linear-gradient(180deg, #f6f8fc 0%, #edf1f7 100%);
}

.tabs-scroll {
  display: flex;
  align-items: flex-end;
  min-width: 0;
  gap: 2px;
  overflow-x: auto;
  scrollbar-width: thin;
}

.nav-tab {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 7px;
  height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: 7px 7px 0 0;
  color: #5d6b82;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
}

.nav-tab:hover {
  color: #1677ff;
  background: rgba(255, 255, 255, 0.68);
}

.nav-tab.active {
  color: #0f63ff;
  background: var(--app-panel);
  font-weight: 700;
}

.tab-close {
  margin-left: 4px;
  color: #7a8495;
  font-size: 12px;
}

.tab-close:hover {
  color: #ff4d4f;
}

:global(.navigation-tab-dropdown .ant-dropdown-menu) {
  min-width: 150px;
  padding: 8px;
}

</style>
