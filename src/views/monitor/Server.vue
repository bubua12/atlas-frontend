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
            <a-col :xs="24" :lg="12">
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
            <a-col :xs="24" :lg="12">
              <a-card title="CPU 信息" size="small">
                <a-descriptions :column="1" size="small" :label-style="{ width: '120px' }">
                  <a-descriptions-item label="核心数">{{ info.cpu?.processors }}</a-descriptions-item>
                  <a-descriptions-item label="使用率">
                    <a-progress
                      :percent="normalizePercent(info.cpu?.usageRate)"
                      size="small"
                      :stroke-color="usageStrokeColor(info.cpu?.usageRate)"
                      :format="formatPercent"
                    />
                  </a-descriptions-item>
                </a-descriptions>
              </a-card>
            </a-col>
          </a-row>

          <a-row :gutter="16" style="margin-bottom: 16px">
            <a-col :xs="24" :lg="12">
              <a-card title="JVM 信息" size="small">
                <a-descriptions :column="1" size="small" :label-style="{ width: '120px' }">
                  <a-descriptions-item label="最大内存">{{ info.jvm?.maxMemory }} MB</a-descriptions-item>
                  <a-descriptions-item label="已申请内存">{{ info.jvm?.totalMemory }} MB</a-descriptions-item>
                  <a-descriptions-item label="已使用内存">{{ info.jvm?.usedMemory }} MB</a-descriptions-item>
                  <a-descriptions-item label="空闲内存">{{ info.jvm?.freeMemory }} MB</a-descriptions-item>
                  <a-descriptions-item label="使用率">
                    <a-progress
                      :percent="normalizePercent(info.jvm?.usageRate)"
                      size="small"
                      :stroke-color="usageStrokeColor(info.jvm?.usageRate)"
                      :format="formatPercent"
                    />
                  </a-descriptions-item>
                  <a-descriptions-item label="运行时长">{{ info.jvm?.runTime }}</a-descriptions-item>
                </a-descriptions>
              </a-card>
            </a-col>
            <a-col :xs="24" :lg="12">
              <a-card title="物理内存" size="small">
                <a-descriptions :column="1" size="small" :label-style="{ width: '120px' }">
                  <a-descriptions-item label="总内存">{{ info.sys?.totalMemory }} MB</a-descriptions-item>
                  <a-descriptions-item label="已使用">{{ info.sys?.usedMemory }} MB</a-descriptions-item>
                  <a-descriptions-item label="剩余">{{ info.sys?.freeMemory }} MB</a-descriptions-item>
                  <a-descriptions-item label="使用率">
                    <a-progress
                      :percent="normalizePercent(info.sys?.usageRate)"
                      size="small"
                      :stroke-color="usageStrokeColor(info.sys?.usageRate)"
                      :format="formatPercent"
                    />
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

// 后端可能返回数字或带 % 的字符串，这里统一成 a-progress 可用的 0-100 数值。
function normalizePercent(value) {
  const percent = typeof value === 'string'
    ? Number.parseFloat(value.replace('%', ''))
    : Number(value)

  if (!Number.isFinite(percent)) return 0
  return Math.min(100, Math.max(0, Number(percent.toFixed(2))))
}

// 不使用 exception 状态，避免 Ant Design Vue 把百分比替换成红色叉号。
function formatPercent(percent) {
  return `${normalizePercent(percent).toFixed(2)}%`
}

// 高占用保持红色进度条提示，但仍然正常展示百分比文本。
function usageStrokeColor(value) {
  const percent = normalizePercent(value)
  if (percent >= 80) return '#ff4d4f'
  return '#4f6bed'
}

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
