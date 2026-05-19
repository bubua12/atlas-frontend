<template>
  <a-popover placement="bottomRight" trigger="click" :open="visible"
             @openChange="onVisibleChange">
    <template #content>
      <div class="message-popover">
        <div class="message-popover-header">
          <span style="font-weight: 600;">消息通知</span>
          <a-button type="link" size="small" @click="handleMarkAllRead"
                    :disabled="messageStore.unreadCount.total === 0">
            全部已读
          </a-button>
        </div>

        <a-spin :spinning="loading">
          <div class="message-list" v-if="messages.length > 0">
            <div v-for="msg in messages" :key="msg.messageId"
                 class="message-item" :class="{ unread: !msg.isRead }"
                 @click="handleClickMessage(msg)">
              <a-badge :dot="!msg.isRead">
                <div class="message-item-content">
                  <div class="message-item-title">{{ msg.title }}</div>
                  <div class="message-item-time">{{ formatTime(msg.publishTime) }}</div>
                </div>
              </a-badge>
            </div>
          </div>
          <a-empty v-else description="暂无消息" :image-style="{ height: '40px' }" />
        </a-spin>

        <div class="message-popover-footer">
          <router-link to="/message" @click="visible = false">查看全部</router-link>
        </div>
      </div>
    </template>

    <a-badge :count="messageStore.badgeCount" :offset="[-6, 2]" :overflow-count="99">
      <BellOutlined class="bell-icon" />
    </a-badge>
  </a-popover>
</template>

<script setup>
import { ref } from 'vue'
import { BellOutlined } from '@ant-design/icons-vue'
import { useMessageStore } from '@/stores/message'
import { listMyMessages, markRead, markAllRead } from '@/api/message'

const messageStore = useMessageStore()
const visible = ref(false)
const loading = ref(false)
const messages = ref([])

async function onVisibleChange(open) {
  visible.value = open
  if (open) {
    loading.value = true
    try {
      const res = await listMyMessages({ pageNum: 1, pageSize: 10 })
      messages.value = res.records || []
    } catch (e) {
      // handled by interceptor
    } finally {
      loading.value = false
    }
  }
}

async function handleClickMessage(msg) {
  if (!msg.isRead) {
    await markRead(msg.messageId)
    messageStore.decrementCount(msg.messageType)
    msg.isRead = 1
  }
  visible.value = false
}

async function handleMarkAllRead() {
  await markAllRead()
  messageStore.clearCount()
  messages.value.forEach(m => { m.isRead = 1 })
}

function formatTime(time) {
  if (!time) return ''
  const date = new Date(time.replace(/-/g, '/'))
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 2) return '昨天'
  return time.substring(5, 16)
}
</script>

<style scoped>
.bell-icon {
  font-size: 20px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.65);
  transition: color 0.2s;
}
.bell-icon:hover {
  color: #1890ff;
}
:deep(.ant-badge .ant-badge-count) {
  font-size: 11px;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  padding: 0 4px;
  box-shadow: none;
}
.message-popover {
  width: 320px;
}
.message-popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}
.message-list {
  max-height: 360px;
  overflow-y: auto;
}
.message-item {
  padding: 8px 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}
.message-item:hover {
  background: #f5f5f5;
}
.message-item.unread {
  background: #e6f7ff;
}
.message-item-content {
  margin-left: 8px;
}
.message-item-title {
  font-size: 13px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 260px;
}
.message-item-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
.message-popover-footer {
  text-align: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}
</style>
