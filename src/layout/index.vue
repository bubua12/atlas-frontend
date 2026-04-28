<template>
  <a-layout class="app-layout">
    <Sidebar />
    <a-layout class="main-layout">
      <Navbar />
      <a-layout-content class="app-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.main-layout {
  min-width: 0;
  min-height: 100vh;
  margin-left: 220px;
}
</style>
