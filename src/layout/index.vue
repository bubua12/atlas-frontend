<template>
  <a-layout class="app-layout">
    <Sidebar />
    <a-layout>
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
</style>
