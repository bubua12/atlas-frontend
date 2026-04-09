<script setup>
import AppHeader from "@/layout/components/AppHeader.vue";
import AppSidebar from "@/layout/components/AppSidebar.vue";
</script>

<template>
  <el-container class="layout-root">
    <app-sidebar/>
    <el-container direction="vertical" class="layout-content">
      <app-header/>
      <el-main class="layout-main">
        <RouterView/>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-root {
  height: 100vh;
}

.layout-content {
  min-width: 0;
}

.layout-main {
  background: #f2f5fa;
  padding: 16px;
  overflow: auto;
}
</style>
