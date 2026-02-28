<template>
  <div>
    <el-card shadow="never">
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="ipaddr" label="登录IP" />
        <el-table-column prop="loginTime" label="登录时间" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-popconfirm title="确认强制下线？" @confirm="handleForceLogout(row.tokenId)">
              <template #reference>
                <el-button link type="danger">强制下线</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref([])

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
  ElMessage.success('操作成功')
  loadData()
}

onMounted(loadData)
</script>
