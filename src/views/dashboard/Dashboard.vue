<template>
  <div>
    <el-row :gutter="16">
      <el-col :span="6" v-for="item in cards" :key="item.title">
        <el-card shadow="hover">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div>
              <div style="font-size:14px;color:#999">{{ item.title }}</div>
              <div style="font-size:24px;font-weight:600;margin-top:8px">{{ item.value }}</div>
            </div>
            <el-icon :size="40" :color="item.color"><component :is="item.icon" /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-card style="margin-top:16px">
      <template #header>欢迎使用 Atlas 管理系统</template>
      <p>当前用户：{{ userStore.username }}</p>
    </el-card>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const cards = [
  { title: '用户数', value: '--', icon: 'User', color: '#409EFF' },
  { title: '角色数', value: '--', icon: 'Key', color: '#67C23A' },
  { title: '菜单数', value: '--', icon: 'Menu', color: '#E6A23C' },
  { title: '部门数', value: '--', icon: 'OfficeBuilding', color: '#F56C6C' }
]
</script>
