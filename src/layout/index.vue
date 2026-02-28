<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-container">
      <Navbar />
      <div class="app-main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
</script>
