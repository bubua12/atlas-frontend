<template>
  <div>
    <a-card :bordered="false">
      <a-table :columns="columns" :data-source="tableData" :loading="loading" row-key="tokenId" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-popconfirm title="确认强制下线？" @confirm="handleForceLogout(record.tokenId)">
              <a-button type="link" danger size="small">强制下线</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref([])
const columns = [
  { title: '用户名', dataIndex: 'username' },
  { title: '登录IP', dataIndex: 'ipaddr' },
  { title: '登录时间', dataIndex: 'loginTime' },
  { title: '操作', key: 'action', width: 120 }
]

async function loadData() {
  loading.value = true
  try {
    const res = await request.get('/monitor/online')
    tableData.value = Array.isArray(res) ? res : []
  } finally {
    loading.value = false
  }
}

async function handleForceLogout(tokenId) {
  await request.delete(`/monitor/online/${tokenId}`)
  message.success('操作成功')
  loadData()
}

onMounted(loadData)
</script>
