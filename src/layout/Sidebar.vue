<template>
  <div class="sidebar">
    <div class="logo">Atlas</div>
    <el-menu :default-active="route.path" router background-color="#304156" text-color="#bfcbd9" active-text-color="#409EFF">
      <el-menu-item index="/dashboard">
        <el-icon><HomeFilled /></el-icon>
        <span>首页</span>
      </el-menu-item>
      <el-sub-menu index="system">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>系统管理</span>
        </template>
        <el-menu-item index="/system/user">用户管理</el-menu-item>
        <el-menu-item index="/system/role">角色管理</el-menu-item>
        <el-menu-item index="/system/menu">菜单管理</el-menu-item>
        <el-menu-item index="/system/dept">部门管理</el-menu-item>
        <el-menu-item index="/system/dict">字典管理</el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="monitor">
        <template #title>
          <el-icon><Monitor /></el-icon>
          <span>系统监控</span>
        </template>
        <el-menu-item index="/monitor/server">服务监控</el-menu-item>
        <el-menu-item index="/monitor/online">在线用户</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>
