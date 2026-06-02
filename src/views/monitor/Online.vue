<template>
  <div class="page-shell">
    <a-card :bordered="false" class="page-panel">
      <div class="page-toolbar">
        <div class="page-title-block">
          <h2 class="page-title">在线用户</h2>
          <div class="page-subtitle">查看在线会话并按需强制下线</div>
        </div>
        <a-button @click="loadData">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
      </div>
      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        row-key="tokenId"
        :pagination="false"
        :scroll="{ x: 820 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-popconfirm title="确认强制下线？" @confirm="handleForceLogout(record.token)">
              <a-button type="link" danger size="small" v-has-permi="['monitor:online:kick']">
                <template #icon><LogoutOutlined /></template>
                强制下线
              </a-button>
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
import { LogoutOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref([])
const columns = [
  { title: '用户名', dataIndex: 'username', width: 160, ellipsis: true },
  { title: '登录IP', dataIndex: 'clientIp', width: 150 },
  { title: '登录时间', dataIndex: 'loginTime', width: 190 },
  { title: '过期时间', dataIndex: 'expireTime', width: 190 },
  { title: '操作', key: 'action', width: 130, fixed: 'right' }
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
