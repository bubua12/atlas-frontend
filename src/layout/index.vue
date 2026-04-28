<template>
  <a-layout class="app-layout">
    <Sidebar />
    <a-layout class="main-layout">
      <Navbar />
      <NavigationTabs @refresh="refreshView" />
      <a-layout-content class="app-content">
        <router-view :key="`${route.fullPath}-${refreshKey}`" />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
import NavigationTabs from './NavigationTabs.vue'

const route = useRoute()
const refreshKey = ref(0)

function refreshView() {
  refreshKey.value += 1
}
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

.app-content {
  min-height: calc(100vh - 96px);
}
</style>
