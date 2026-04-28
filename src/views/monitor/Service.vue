<template>
  <div class="page-shell">
    <a-card :bordered="false" class="page-panel">
      <div class="page-toolbar">
        <div class="page-title-block">
          <h2 class="page-title">服务状态</h2>
          <div class="page-subtitle">查看各微服务的健康状态和实例信息</div>
        </div>
        <a-button @click="loadData">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
      </div>

      <a-spin :spinning="loading">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :pagination="false"
          row-key="serviceName"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-badge
                :status="record.status === 'UP' ? 'success' : (record.status === 'DOWN' || record.status === 'OFFLINE' ? 'error' : 'warning')"
                :text="record.status"
              />
            </template>
            <template v-if="column.key === 'instances'">
              <a-tag
                v-for="inst in record.instances"
                :key="inst.instanceId"
                :color="inst.status === 'UP' ? 'green' : 'red'"
                style="margin-bottom: 4px"
              >
                {{ inst.serviceUrl || inst.instanceId }}
              </a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small" @click="handleDetail(record)">详情</a-button>
            </template>
          </template>
        </a-table>
      </a-spin>
    </a-card>

    <!-- 详情弹窗 -->
    <a-modal v-model:open="detailVisible" title="服务实例详情" :footer="null" width="640px">
      <a-descriptions :column="1" bordered size="small" v-if="detailData">
        <a-descriptions-item label="服务名称">{{ detailData.serviceName }}</a-descriptions-item>
        <a-descriptions-item label="聚合状态">
          <a-badge
            :status="detailData.status === 'UP' ? 'success' : 'error'"
            :text="detailData.status"
          />
        </a-descriptions-item>
        <a-descriptions-item label="实例数量">{{ detailData.instanceCount }}</a-descriptions-item>
      </a-descriptions>
      <a-table
        v-if="detailData?.instances?.length"
        :columns="instanceColumns"
        :data-source="detailData.instances"
        :pagination="false"
        row-key="instanceId"
        size="small"
        style="margin-top: 16px"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-badge
              :status="record.status === 'UP' ? 'success' : 'error'"
              :text="record.status"
            />
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref([])
const detailVisible = ref(false)
const detailData = ref(null)

const columns = [
  { title: '服务名称', dataIndex: 'serviceName', width: 180 },
  { title: '状态', key: 'status', width: 100, align: 'center' },
  { title: '实例数', dataIndex: 'instanceCount', width: 80, align: 'center' },
  { title: '实例列表', key: 'instances' },
  { title: '操作', key: 'action', width: 80, fixed: 'right' }
]

const instanceColumns = [
  { title: '实例ID', dataIndex: 'instanceId', ellipsis: true },
  { title: '状态', key: 'status', width: 80, align: 'center' },
  { title: '服务地址', dataIndex: 'serviceUrl', ellipsis: true },
  { title: '注册时间', dataIndex: 'registrationTime', width: 170 }
]

async function loadData() {
  loading.value = true
  try {
    const res = await request.get('/monitor/service')
    tableData.value = Array.isArray(res) ? res : []
  } finally {
    loading.value = false
  }
}

async function handleDetail(record) {
  try {
    detailData.value = await request.get(`/monitor/service/${record.serviceName}`)
    detailVisible.value = true
  } catch {}
}

onMounted(loadData)
</script>
