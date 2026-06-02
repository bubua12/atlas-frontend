<template>
  <a-sub-menu v-if="menu.children?.length" :key="menu.path">
    <template #icon>
      <component :is="getIcon(menu.meta?.icon)" v-if="getIcon(menu.meta?.icon)" />
    </template>
    <template #title>{{ menu.meta?.title }}</template>
    <template v-for="child in menu.children" :key="child.path">
      <SubMenuRecursive v-if="!child.hidden" :menu="child" :parent-path="fullPath" />
    </template>
  </a-sub-menu>
  <a-menu-item v-else :key="fullPath">
    <template #icon>
      <component :is="getIcon(menu.meta?.icon)" v-if="getIcon(menu.meta?.icon)" />
    </template>
    {{ menu.meta?.title }}
  </a-menu-item>
</template>

<script setup>
import { computed } from 'vue'
import * as Icons from '@ant-design/icons-vue'

const props = defineProps({
  menu: { type: Object, required: true },
  parentPath: { type: String, default: '' }
})

// 拼接完整路径：子菜单的 path 是相对路径，需要和父级拼接
const fullPath = computed(() => {
  const path = props.menu.path || ''
  if (path.startsWith('/')) return path
  const base = props.parentPath || ''
  return base ? `${base}/${path}` : `/${path}`
})

function getIcon(iconName) {
  if (!iconName || iconName === '#') return null
  return Icons[iconName] || null
}
</script>
