<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">404</div>
      <div class="error-title">页面不存在</div>
      <div class="error-desc">抱歉，您访问的页面不存在或已被移除</div>
      <a-button type="primary" size="large" @click="router.push('/')">
        <template #icon><HomeOutlined /></template>
        返回首页
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { HomeOutlined } from '@ant-design/icons-vue'

const router = useRouter()
</script>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--app-bg);
}

.error-content {
  text-align: center;
}

.error-code {
  font-size: 120px;
  font-weight: 800;
  line-height: 1;
  color: var(--app-border-strong);
  user-select: none;
}

.error-title {
  margin-top: 16px;
  font-size: 24px;
  font-weight: 600;
  color: var(--app-text);
}

.error-desc {
  margin-top: 8px;
  margin-bottom: 32px;
  font-size: 14px;
  color: var(--app-text-muted);
}
</style>
