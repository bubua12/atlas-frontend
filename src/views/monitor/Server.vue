<template>
  <div class="page-shell">
    <a-card :bordered="false" class="page-panel">
      <div class="page-toolbar">
        <div class="page-title-block">
          <h2 class="page-title">服务监控</h2>
          <div class="page-subtitle">查看当前服务运行环境和资源信息</div>
        </div>
        <a-button @click="loadData">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
      </div>
      <a-spin :spinning="loading">
        <a-descriptions :column="2" bordered v-if="info" class="server-descriptions">
          <a-descriptions-item v-for="(val, key) in info" :key="key" :label="key">{{ val }}</a-descriptions-item>
        </a-descriptions>
        <a-empty v-else description="暂无数据" />
      </a-spin>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
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
