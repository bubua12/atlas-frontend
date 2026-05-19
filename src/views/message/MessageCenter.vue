<template>
  <div class="page-shell">
    <a-card :bordered="false" class="page-panel">
      <div class="page-toolbar">
        <div class="page-title-block">
          <h2 class="page-title">消息中心</h2>
          <div class="page-subtitle">查看和管理您的消息通知</div>
        </div>
        <div class="page-toolbar-main">
          <a-button @click="handleMarkAllRead" :disabled="messageStore.unreadCount.total === 0">
            全部已读
          </a-button>
          <a-button danger @click="handleBatchDelete" :disabled="!selectedRowKeys.length">
            批量删除
          </a-button>
        </div>
      </div>

      <!-- 类型筛选 -->
      <div style="margin-bottom: 16px;">
        <a-space>
          <a-tag :color="currentType === '' ? 'blue' : 'default'"
                 @click="currentType = ''; loadData()" style="cursor: pointer;">
            全部({{ messageStore.unreadCount.total }})
          </a-tag>
          <a-tag :color="currentType === 'ANNOUNCEMENT' ? 'blue' : 'default'"
                 @click="currentType = 'ANNOUNCEMENT'; loadData()" style="cursor: pointer;">
            系统公告({{ messageStore.unreadCount.announcement }})
          </a-tag>
          <a-tag :color="currentType === 'SYSTEM' ? 'blue' : 'default'"
                 @click="currentType = 'SYSTEM'; loadData()" style="cursor: pointer;">
            系统通知({{ messageStore.unreadCount.system }})
          </a-tag>
          <a-tag :color="currentType === 'ALERT' ? 'blue' : 'default'"
                 @click="currentType = 'ALERT'; loadData()" style="cursor: pointer;">
            安全告警({{ messageStore.unreadCount.alert }})
          </a-tag>
        </a-space>
      </div>

      <a-table :columns="columns" :data-source="dataList" :loading="loading"
               :pagination="pagination" :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
               row-key="messageId" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'title'">
            <a-badge :dot="!record.isRead">
              <span :style="{ fontWeight: record.isRead ? 'normal' : '600' }">
                {{ record.title }}
              </span>
            </a-badge>
          </template>
          <template v-if="column.key === 'messageType'">
            <a-tag :color="typeColorMap[record.messageType]">
              {{ typeLabelMap[record.messageType] }}
            </a-tag>
          </template>
          <template v-if="column.key === 'isRead'">
            <a-tag :color="record.isRead ? 'default' : 'red'">
              {{ record.isRead ? '已读' : '未读' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a @click="handleViewDetail(record)">查看</a>
              <a v-if="!record.isRead" @click="handleMarkRead(record)">标记已读</a>
              <a style="color: #ff4d4f;" @click="handleDelete(record)">删除</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 消息详情弹窗 -->
    <a-modal v-model:open="detailVisible" :title="detailMessage?.title"
             :footer="null" width="700px">
      <div v-if="detailMessage">
        <a-descriptions :column="1" size="small" bordered style="margin-bottom: 16px;">
          <a-descriptions-item label="类型">
            <a-tag :color="typeColorMap[detailMessage.messageType]">
              {{ typeLabelMap[detailMessage.messageType] }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="发布时间">{{ detailMessage.publishTime }}</a-descriptions-item>
        </a-descriptions>
        <div class="message-detail-content">
          <MdPreview :modelValue="detailMessage.content || ''" language="zh-CN" :previewTheme="'default'" />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { useMessageStore } from '@/stores/message'
import { listMyMessages, markRead, markAllRead, deleteMessage, batchDeleteMessages } from '@/api/message'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const messageStore = useMessageStore()

const loading = ref(false)
const dataList = ref([])
const selectedRowKeys = ref([])
const currentType = ref('')
const detailVisible = ref(false)
const detailMessage = ref(null)

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`
})

const typeLabelMap = {
  ANNOUNCEMENT: '系统公告',
  SYSTEM: '系统通知',
  ALERT: '安全告警'
}
const typeColorMap = {
  ANNOUNCEMENT: 'blue',
  SYSTEM: 'green',
  ALERT: 'red'
}

const columns = [
  { title: '标题', key: 'title', dataIndex: 'title', ellipsis: true },
  { title: '类型', key: 'messageType', dataIndex: 'messageType', width: 100 },
  { title: '状态', key: 'isRead', dataIndex: 'isRead', width: 80 },
  { title: '时间', dataIndex: 'publishTime', width: 160 },
  { title: '操作', key: 'action', width: 150 }
]

onMounted(() => {
  loadData()
  messageStore.fetchUnreadCount()
})

async function loadData() {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize
    }
    if (currentType.value) {
      params.messageType = currentType.value
    }
    const res = await listMyMessages(params)
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

function onSelectChange(keys) {
  selectedRowKeys.value = keys
}

function handleViewDetail(record) {
  detailMessage.value = record
  detailVisible.value = true
  if (!record.isRead) {
    handleMarkRead(record)
  }
}

async function handleMarkRead(record) {
  await markRead(record.messageId)
  record.isRead = 1
  messageStore.decrementCount(record.messageType)
  message.success('已标记为已读')
}

async function handleMarkAllRead() {
  await markAllRead()
  dataList.value.forEach(m => { m.isRead = 1 })
  messageStore.clearCount()
  message.success('全部已读')
}

function handleDelete(record) {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这条消息吗？',
    onOk: async () => {
      await deleteMessage(record.messageId)
      if (!record.isRead) {
        messageStore.decrementCount(record.messageType)
      }
      message.success('删除成功')
      loadData()
    }
  })
}

async function handleBatchDelete() {
  if (!selectedRowKeys.value.length) return
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 条消息吗？`,
    onOk: async () => {
      await batchDeleteMessages(selectedRowKeys.value)
      message.success('批量删除成功')
      selectedRowKeys.value = []
      loadData()
    }
  })
}
</script>

<style scoped>
.message-detail-content :deep(.md-editor) {
  border: none;
  background: transparent;
}
.message-detail-content :deep(.md-editor-preview) {
  padding: 0;
}
</style>
