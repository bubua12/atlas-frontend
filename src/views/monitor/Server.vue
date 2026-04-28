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
        <template v-if="info">
          <a-row :gutter="16" style="margin-bottom: 16px">
            <a-col :span="12">
              <a-card title="基础信息" size="small">
                <a-descriptions :column="1" size="small" :label-style="{ width: '120px' }">
                  <a-descriptions-item label="主机名">{{ info.hostName }}</a-descriptions-item>
                  <a-descriptions-item label="操作系统">{{ info.os }}</a-descriptions-item>
                  <a-descriptions-item label="系统架构">{{ info.arch }}</a-descriptions-item>
                  <a-descriptions-item label="Java 版本">{{ info.javaVersion }}</a-descriptions-item>
                  <a-descriptions-item label="CPU 核心数">{{ info.processors }}</a-descriptions-item>
                </a-descriptions>
              </a-card>
            </a-col>
            <a-col :span="12">
              <a-card title="CPU 信息" size="small">
                <a-descriptions :column="1" size="small" :label-style="{ width: '120px' }">
                  <a-descriptions-item label="核心数">{{ info.cpu?.processors }}</a-descriptions-item>
                  <a-descriptions-item label="使用率">
                    <a-progress :percent="info.cpu?.usageRate" size="small" :status="info.cpu?.usageRate > 80 ? 'exception' : 'normal'" />
                  </a-descriptions-item>
                </a-descriptions>
              </a-card>
            </a-col>
          </a-row>

          <a-row :gutter="16" style="margin-bottom: 16px">
            <a-col :span="12">
              <a-card title="JVM 信息" size="small">
                <a-descriptions :column="1" size="small" :label-style="{ width: '120px' }">
                  <a-descriptions-item label="最大内存">{{ info.jvm?.maxMemory }} MB</a-descriptions-item>
                  <a-descriptions-item label="已申请内存">{{ info.jvm?.totalMemory }} MB</a-descriptions-item>
                  <a-descriptions-item label="已使用内存">{{ info.jvm?.usedMemory }} MB</a-descriptions-item>
                  <a-descriptions-item label="空闲内存">{{ info.jvm?.freeMemory }} MB</a-descriptions-item>
                  <a-descriptions-item label="使用率">
                    <a-progress :percent="info.jvm?.usageRate" size="small" :status="info.jvm?.usageRate > 80 ? 'exception' : 'normal'" />
                  </a-descriptions-item>
                  <a-descriptions-item label="运行时长">{{ info.jvm?.runTime }}</a-descriptions-item>
                </a-descriptions>
              </a-card>
            </a-col>
            <a-col :span="12">
              <a-card title="物理内存" size="small">
                <a-descriptions :column="1" size="small" :label-style="{ width: '120px' }">
                  <a-descriptions-item label="总内存">{{ info.sys?.totalMemory }} MB</a-descriptions-item>
                  <a-descriptions-item label="已使用">{{ info.sys?.usedMemory }} MB</a-descriptions-item>
                  <a-descriptions-item label="剩余">{{ info.sys?.freeMemory }} MB</a-descriptions-item>
                  <a-descriptions-item label="使用率">
                    <a-progress :percent="info.sys?.usageRate" size="small" :status="info.sys?.usageRate > 80 ? 'exception' : 'normal'" />
                  </a-descriptions-item>
                </a-descriptions>
              </a-card>
            </a-col>
          </a-row>
        </template>
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
