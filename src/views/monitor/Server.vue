<template>
  <div>
    <a-card :bordered="false">
      <a-spin :spinning="loading">
        <a-descriptions title="服务器信息" :column="2" bordered v-if="info">
          <a-descriptions-item v-for="(val, key) in info" :key="key" :label="key">{{ val }}</a-descriptions-item>
        </a-descriptions>
        <a-empty v-else description="暂无数据" />
      </a-spin>
    </a-card>
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
