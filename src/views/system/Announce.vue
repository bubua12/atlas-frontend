<template>
  <div class="page-shell">
    <a-card :bordered="false" class="page-panel">
      <div class="page-toolbar">
        <div class="page-title-block">
          <h2 class="page-title">公告管理</h2>
          <div class="page-subtitle">管理系统公告的发布、编辑和撤回</div>
        </div>
        <div class="page-toolbar-main">
          <a-select v-model:value="queryForm.status" placeholder="状态筛选" allow-clear
                    style="width: 120px;" @change="loadData">
            <a-select-option :value="0">草稿</a-select-option>
            <a-select-option :value="1">已发布</a-select-option>
            <a-select-option :value="2">已撤回</a-select-option>
          </a-select>
          <a-button type="primary" @click="openDialog()">
            <PlusOutlined /> 发布公告
          </a-button>
        </div>
      </div>

      <a-table :columns="columns" :data-source="dataList" :loading="loading"
               :pagination="pagination" row-key="messageId" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'messageType'">
            <a-tag :color="typeColorMap[record.messageType]">
              {{ typeLabelMap[record.messageType] }}
            </a-tag>
          </template>
          <template v-if="column.key === 'sendScope'">
            {{ scopeLabelMap[record.sendScope] }}
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="statusColorMap[record.status]">
              {{ statusLabelMap[record.status] }}
            </a-tag>
          </template>
          <template v-if="column.key === 'readProgress'">
            <span>{{ record.readCount }} / {{ record.totalCount }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a v-if="record.status === 0 || record.status === 1" @click="openDialog(record)">编辑</a>
              <a v-if="record.status === 1" @click="handleRevoke(record)">撤回</a>
              <a style="color: #ff4d4f;" @click="handleDelete(record)">删除</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 创建/编辑公告弹窗 -->
    <a-modal v-model:open="dialogVisible"
             :title="form.messageId ? '编辑公告' : '发布公告'"
             @ok="handleSubmit" :confirm-loading="submitLoading"
             width="600px" :mask-closable="false">
      <a-form :model="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-form-item label="标题" required>
          <a-input v-model:value="form.title" placeholder="请输入公告标题" :maxlength="200" />
        </a-form-item>
        <a-form-item label="类型" required>
          <a-select v-model:value="form.messageType">
            <a-select-option value="ANNOUNCEMENT">系统公告</a-select-option>
            <a-select-option value="SYSTEM">系统通知</a-select-option>
            <a-select-option value="ALERT">安全告警</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="发送范围">
          <a-select v-model:value="form.sendScope" @change="form.scopeValue = null">
            <a-select-option value="ALL">全员</a-select-option>
            <a-select-option value="ROLE">指定角色</a-select-option>
            <a-select-option value="DEPT">指定部门</a-select-option>
            <a-select-option value="USER">指定用户</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="form.sendScope !== 'ALL'" label="范围值">
          <a-input v-model:value="form.scopeValue"
                   :placeholder="scopePlaceholder" />
        </a-form-item>
        <a-form-item label="内容">
          <a-textarea v-model:value="form.content" :rows="8" placeholder="公告内容（支持 Markdown）" />
        </a-form-item>
        <a-form-item label="置顶">
          <a-switch v-model:checked="form.isTop" :checked-value="1" :unchecked-value="0" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { listAnnounces, createAnnounce, updateAnnounce, revokeAnnounce, deleteAnnounce } from '@/api/message'

const loading = ref(false)
const submitLoading = ref(false)
const dataList = ref([])
const dialogVisible = ref(false)

const queryForm = reactive({
  status: undefined
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`
})

const form = reactive({
  messageId: null,
  title: '',
  content: '',
  messageType: 'ANNOUNCEMENT',
  sendScope: 'ALL',
  scopeValue: null,
  isTop: 0,
  scheduledTime: null
})

const typeLabelMap = { ANNOUNCEMENT: '系统公告', SYSTEM: '系统通知', ALERT: '安全告警' }
const typeColorMap = { ANNOUNCEMENT: 'blue', SYSTEM: 'green', ALERT: 'red' }
const scopeLabelMap = { ALL: '全员', ROLE: '指定角色', DEPT: '指定部门', USER: '指定用户' }
const statusLabelMap = { 0: '草稿', 1: '已发布', 2: '已撤回' }
const statusColorMap = { 0: 'default', 1: 'green', 2: 'orange' }

const scopePlaceholder = computed(() => {
  const map = { ROLE: '角色ID，多个用逗号分隔', DEPT: '部门ID，多个用逗号分隔', USER: '用户ID，多个用逗号分隔' }
  return map[form.sendScope] || ''
})

const columns = [
  { title: '标题', dataIndex: 'title', ellipsis: true },
  { title: '类型', key: 'messageType', dataIndex: 'messageType', width: 100 },
  { title: '发送范围', key: 'sendScope', dataIndex: 'sendScope', width: 100 },
  { title: '已读/投递', key: 'readProgress', width: 100 },
  { title: '状态', key: 'status', dataIndex: 'status', width: 80 },
  { title: '发布时间', dataIndex: 'publishTime', width: 160 },
  { title: '操作', key: 'action', width: 160 }
]

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      ...queryForm
    }
    const res = await listAnnounces(params)
    dataList.value = res.records || []
    pagination.total = res.total || 0
  } catch (e) {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

function handleTableChange(pag) {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

function openDialog(record) {
  if (record) {
    Object.assign(form, {
      messageId: record.messageId,
      title: record.title,
      content: record.content,
      messageType: record.messageType,
      sendScope: record.sendScope || 'ALL',
      scopeValue: record.scopeValue,
      isTop: record.isTop,
      scheduledTime: record.scheduledTime
    })
  } else {
    Object.assign(form, {
      messageId: null, title: '', content: '', messageType: 'ANNOUNCEMENT',
      sendScope: 'ALL', scopeValue: null, isTop: 0, scheduledTime: null
    })
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!form.title) {
    message.warning('请输入标题')
    return
  }
  submitLoading.value = true
  try {
    if (form.messageId) {
      await updateAnnounce({ ...form })
      message.success('更新成功')
    } else {
      await createAnnounce({ ...form })
      message.success('发布成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (e) {
    // handled by interceptor
  } finally {
    submitLoading.value = false
  }
}

function handleRevoke(record) {
  Modal.confirm({
    title: '确认撤回',
    content: `确定要撤回公告"${record.title}"吗？`,
    onOk: async () => {
      await revokeAnnounce(record.messageId)
      message.success('撤回成功')
      loadData()
    }
  })
}

function handleDelete(record) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除公告"${record.title}"吗？`,
    onOk: async () => {
      await deleteAnnounce(record.messageId)
      message.success('删除成功')
      loadData()
    }
  })
}
</script>
