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
  <el-card style="max-width: 480px">
    <template #header>
      <div class="card-header">
        <span>Card name</span>
      </div>
    </template>
    <p v-for="o in 4" :key="o" class="text item">{{ 'List item ' + o }}</p>
    <template #footer>Footer content</template>
  </el-card>
</template>


<style scoped>

</style>