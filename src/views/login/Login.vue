<script setup>

import {menuList} from "@/api/system/system.js";
import {onMounted} from "vue";

onMounted(async () => {
  try {
    const data = await menuList()
    console.log('菜单信息:', data)
  } catch (err) {
    console.log('请求失败:', err)
  }
})

</script>

<template>
  <h1>登录页面</h1>
</template>

<style scoped>

</style>