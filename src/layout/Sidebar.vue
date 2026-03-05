<template>
  <a-layout-sider :width="210" theme="dark">
    <div style="height:50px;line-height:50px;text-align:center;font-size:16px;font-weight:600;color:#fff;background:#263445">Atlas</div>
    <a-menu theme="dark" :selected-keys="[route.path]" mode="inline" @click="({ key }) => router.push(key)">
      <a-menu-item key="/dashboard">
        <template #icon><HomeOutlined /></template>
        首页
      </a-menu-item>
      <a-sub-menu key="system">
        <template #icon><SettingOutlined /></template>
        <template #title>系统管理</template>
        <a-menu-item key="/system/user">用户管理</a-menu-item>
        <a-menu-item key="/system/role">角色管理</a-menu-item>
        <a-menu-item key="/system/menu">菜单管理</a-menu-item>
        <a-menu-item key="/system/dept">部门管理</a-menu-item>
        <a-menu-item key="/system/dict">字典管理</a-menu-item>
        <a-menu-item key="/system/config">系统设置</a-menu-item>
      </a-sub-menu>
      <a-sub-menu key="monitor">
        <template #icon><DesktopOutlined /></template>
        <template #title>系统监控</template>
        <a-menu-item key="/monitor/server">服务监控</a-menu-item>
        <a-menu-item key="/monitor/online">在线用户</a-menu-item>
      </a-sub-menu>
    </a-menu>
  </a-layout-sider>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { HomeOutlined, SettingOutlined, DesktopOutlined } from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
</script>
