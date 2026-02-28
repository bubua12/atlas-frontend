<template>
  <div>
    <a-row :gutter="16">
      <a-col :span="6" v-for="item in cards" :key="item.title">
        <a-card hoverable>
          <a-statistic :title="item.title" :value="item.value" :value-style="{ color: item.color }" />
        </a-card>
      </a-col>
    </a-row>
    <a-card style="margin-top:16px" title="欢迎使用 Atlas 管理系统">
      <p>当前用户：{{ userStore.username }}</p>
    </a-card>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const cards = [
  { title: '用户数', value: '--', color: '#1677ff' },
  { title: '角色数', value: '--', color: '#52c41a' },
  { title: '菜单数', value: '--', color: '#faad14' },
  { title: '部门数', value: '--', color: '#ff4d4f' }
]
</script>
