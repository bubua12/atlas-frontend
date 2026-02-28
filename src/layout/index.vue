<template>
  <a-layout style="min-height:100vh">
    <Sidebar />
    <a-layout>
      <Navbar />
      <a-layout-content style="padding:16px;overflow-y:auto">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
</script>
