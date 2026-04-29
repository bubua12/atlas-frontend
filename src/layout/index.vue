<template>
  <a-layout class="app-layout">
    <Sidebar />
    <a-layout class="main-layout">
      <Navbar />
      <NavigationTabs @refresh="refreshView" />
      <a-watermark
        class="app-watermark"
        :content="watermarkStore.content"
        :font="watermarkStore.font"
        :gap="watermarkStore.gap"
        :height="36"
        :rotate="-24"
        :z-index="5"
      >
        <a-layout-content class="app-content">
          <router-view :key="`${route.fullPath}-${refreshKey}`" />
        </a-layout-content>
      </a-watermark>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useWatermarkStore } from '@/stores/watermark'
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
import NavigationTabs from './NavigationTabs.vue'

const route = useRoute()
const refreshKey = ref(0)
const watermarkStore = useWatermarkStore()

function refreshView() {
  refreshKey.value += 1
}

onMounted(() => {
  watermarkStore.load(true).catch(() => watermarkStore.reset())
})
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

.app-watermark {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}

.app-content {
  min-height: calc(100vh - 96px);
}
</style>
