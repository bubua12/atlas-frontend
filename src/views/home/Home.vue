<script setup>
import {computed, reactive, ref} from "vue";
const activeTab = ref("全部");
const searchKeyword = ref("");

const tableRows = reactive([
  {id: "U0001", name: "刘一", phone: "13800010001", email: "liu1@atlas.com", status: true, role: "管理员"},
  {id: "U0002", name: "陈二", phone: "13800010002", email: "chen2@atlas.com", status: true, role: "运营"},
  {id: "U0003", name: "张三", phone: "13800010003", email: "zhang3@atlas.com", status: false, role: "访客"},
  {id: "U0004", name: "李四", phone: "13800010004", email: "li4@atlas.com", status: true, role: "财务"},
  {id: "U0005", name: "王五", phone: "13800010005", email: "wang5@atlas.com", status: true, role: "开发"}
]);

const overviewCards = reactive([
  {label: "用户总数", value: "4,680", trend: "+12.6%"},
  {label: "在线人数", value: "238", trend: "+3.2%"},
  {label: "今日新增", value: "42", trend: "+8.1%"},
  {label: "待处理工单", value: "17", trend: "-2.4%"}
]);

const filteredRows = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  let rows = tableRows;
  if (activeTab.value === "启用中") {
    rows = rows.filter(item => item.status);
  }
  if (activeTab.value === "已停用") {
    rows = rows.filter(item => !item.status);
  }
  if (!keyword) {
    return rows;
  }
  return rows.filter(item =>
      item.name.toLowerCase().includes(keyword) ||
      item.phone.includes(keyword) ||
      item.email.toLowerCase().includes(keyword) ||
      item.role.toLowerCase().includes(keyword)
  );
});
</script>

<template>
  <div>
    <div class="overview-grid">
      <el-card v-for="card in overviewCards" :key="card.label" shadow="hover" class="overview-item">
        <div class="overview-label">{{ card.label }}</div>
        <div class="overview-value">{{ card.value }}</div>
        <div class="overview-trend">{{ card.trend }}</div>
      </el-card>
    </div>

    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <el-input
            v-model="searchKeyword"
            placeholder="筛选姓名、手机号、邮箱、角色"
            class="content-search"
            clearable
        />
        <el-segmented
            v-model="activeTab"
            :options="['全部', '启用中', '已停用']"
        />
        <div class="toolbar-actions">
          <el-button type="primary">新增用户</el-button>
          <el-button>导入</el-button>
          <el-button>导出</el-button>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="filteredRows" border stripe>
        <el-table-column prop="id" label="编号" width="120"/>
        <el-table-column prop="name" label="姓名" width="120"/>
        <el-table-column prop="phone" label="手机号" width="160"/>
        <el-table-column prop="email" label="邮箱"/>
        <el-table-column prop="role" label="角色" width="120"/>
        <el-table-column label="状态" width="100">
          <template #default="{row}">
            <el-switch v-model="row.status"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default>
            <el-button link type="primary">查看</el-button>
            <el-button link type="warning">编辑</el-button>
            <el-button link type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-pagination">
        <el-pagination
            background
            layout="total, prev, pager, next"
            :total="filteredRows.length"
            :page-size="10"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.overview-item {
  border: none;
  border-radius: 10px;
}

.overview-label {
  color: #6b7c92;
  font-size: 13px;
}

.overview-value {
  margin-top: 6px;
  font-size: 26px;
  font-weight: 700;
  color: #1f2937;
}

.overview-trend {
  margin-top: 6px;
  color: #3b82f6;
  font-size: 12px;
}

.toolbar-card {
  margin-bottom: 12px;
  border: none;
  border-radius: 10px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.content-search {
  width: 320px;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.table-card {
  min-height: 420px;
  border: none;
  border-radius: 10px;
}

.table-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

@media (max-width: 1280px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-search {
    width: 100%;
    max-width: 320px;
  }
}

@media (max-width: 900px) {
  .content-search {
    max-width: 100%;
  }
}
</style>
