<script setup>
</script>

<template>
  <div class="dashboard-page">
    <el-card shadow="never" class="dashboard-card">
      <template #header>
        <div class="card-title">数据看板</div>
      </template>
      <div class="dashboard-grid">
        <div class="grid-item">访问趋势</div>
        <div class="grid-item">用户增长</div>
        <div class="grid-item">来源分析</div>
        <div class="grid-item">业务分布</div>
      </div>
    </el-card>
  </div>
</template>


<style scoped>
.dashboard-page {
  width: 100%;
}

.dashboard-card {
  width: 100%;
  border-radius: 10px;
  border: none;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.grid-item {
  min-height: 180px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f5f8ff 0%, #eef3ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a5d7a;
  font-size: 14px;
}
</style>
