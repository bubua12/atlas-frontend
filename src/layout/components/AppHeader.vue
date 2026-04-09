<script setup>
import {computed, ref} from "vue";
import {ElMessage} from "element-plus";
import {useRoute, useRouter} from "vue-router";

const route = useRoute();
const router = useRouter();
const searchKeyword = ref("");

const breadcrumbList = computed(() => {
  const titles = route.matched
      .map(item => item.meta?.title)
      .filter(Boolean);
  return titles.length ? titles : ["首页"];
});

const handleSearch = () => {
  ElMessage.success(`搜索：${searchKeyword.value || "全部"}`);
};

const handleProfile = () => {
  ElMessage.success("打开个人设置");
};

const handleLogout = async () => {
  localStorage.removeItem("token");
  ElMessage.success("已退出登录");
  await router.push("/login");
};
</script>

<template>
  <el-header class="layout-header">
    <div class="header-left">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="item in breadcrumbList" :key="item">
          {{ item }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header-right">
      <el-input
          v-model="searchKeyword"
          placeholder="搜索用户、角色、菜单..."
          class="header-search"
          @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
      <el-button link type="primary" @click="handleProfile">个人设置</el-button>
      <el-badge :value="3" :max="99">
        <el-button link>消息</el-button>
      </el-badge>
      <el-avatar size="small">管</el-avatar>
      <span class="user-name">管理员</span>
      <el-button type="danger" plain size="small" @click="handleLogout">退出</el-button>
    </div>
  </el-header>
</template>

<style scoped>
.layout-header {
  height: 72px;
  border-bottom: 1px solid #e6ebf2;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 18px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-search {
  width: 360px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  color: #334155;
  font-size: 14px;
}

@media (max-width: 1280px) {
  .header-search {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 900px) {
  .layout-header {
    height: auto;
    min-height: 72px;
    flex-wrap: wrap;
    padding: 10px 12px;
  }

  .header-right {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
  }

  .header-search {
    width: 100%;
    max-width: none;
  }
}
</style>
