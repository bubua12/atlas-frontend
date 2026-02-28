<template>
  <div>
    <el-card shadow="never" v-loading="loading">
      <el-descriptions title="服务器信息" :column="2" border v-if="info">
        <el-descriptions-item v-for="(val, key) in info" :key="key" :label="key">{{ val }}</el-descriptions-item>
      </el-descriptions>
      <el-empty v-else description="暂无数据" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const loading = ref(false)
const info = ref(null)

async function loadData() {
  loading.value = true
  try {
    info.value = await request.get('/monitor/server/info')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>
