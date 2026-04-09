<script setup>
import {computed, onMounted, ref} from "vue";
import {ElMessage} from "element-plus";
import {useRoute, useRouter} from "vue-router";
import {menuList} from "@/api/system/system.js";

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const menus = ref([]);

const localFallbackMenus = [
  {
    key: "local-workbench",
    label: "工作台",
    path: "",
    children: [
      {key: "local-home", label: "首页", path: "/home"},
      {key: "local-about", label: "数据看板", path: "/about"}
    ]
  }
];

const menuKeysByPath = computed(() => {
  const map = {};
  const walk = (items) => {
    items.forEach(item => {
      if (item.path) {
        map[item.path] = item.key;
      }
      if (item.children?.length) {
        walk(item.children);
      }
    });
  };
  walk(menus.value);
  return map;
});

const activeMenuKey = computed(() => {
  if (menuKeysByPath.value[route.path]) {
    return menuKeysByPath.value[route.path];
  }
  const candidatePath = Object.keys(menuKeysByPath.value)
      .filter(path => route.path.startsWith(path))
      .sort((a, b) => b.length - a.length)[0];
  return candidatePath ? menuKeysByPath.value[candidatePath] : "";
});

const defaultOpeneds = computed(() => menus.value.map(item => item.key));

const normalizePath = (path) => {
  if (!path || path === "#") {
    return "";
  }
  if (path.startsWith("http")) {
    return path;
  }
  return path.startsWith("/") ? path : `/${path}`;
};

const normalizeMenus = (items, prefix = "menu") => {
  return (items || []).map((item, index) => {
    const key = String(item.id || item.menuId || item.path || `${prefix}-${index}`);
    const label = item.title || item.menuName || item.name || item.label || `菜单${index + 1}`;
    const path = normalizePath(item.path || item.routePath || item.url || "");
    const children = normalizeMenus(item.children || item.childList || [], `${key}-child`);
    return {key, label, path, children};
  });
};

const handleSelect = (item) => {
  if (!item.path) {
    return;
  }
  if (item.path.startsWith("http")) {
    window.open(item.path, "_blank");
    return;
  }
  if (item.path !== route.path) {
    router.push(item.path);
  }
};

const loadMenus = async () => {
  loading.value = true;
  try {
    const response = await menuList();
    const rawMenus = Array.isArray(response)
        ? response
        : response?.records || response?.list || response?.menus || response?.data || [];
    const normalized = normalizeMenus(rawMenus);
    menus.value = normalized.length ? normalized : localFallbackMenus;
  } catch (error) {
    menus.value = localFallbackMenus;
    ElMessage.warning("菜单加载失败，已使用默认菜单");
  } finally {
    loading.value = false;
  }
};

onMounted(loadMenus);
</script>

<template>
  <el-aside width="236px" class="layout-aside">
    <div class="logo">
      <img src="/atlas.png" alt="Atlas" class="logo-mark" />
      <div class="logo-text">
        <div class="logo-title">Atlas</div>
        <div class="logo-sub">企业管理平台</div>
      </div>
    </div>
    <el-menu
        :default-active="activeMenuKey"
        :default-openeds="defaultOpeneds"
        class="menu-list"
        background-color="transparent"
        text-color="#99aac0"
        active-text-color="#ffffff"
        :ellipsis="false"
        unique-opened
    >
      <template v-for="group in menus" :key="group.key">
        <el-sub-menu
            v-if="group.children?.length"
            :index="group.key"
        >
          <template #title>{{ group.label }}</template>
          <el-menu-item
              v-for="item in group.children"
              :key="item.key"
              :index="item.key"
              @click="handleSelect(item)"
          >
            {{ item.label }}
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item
            v-else
            :index="group.key"
            @click="handleSelect(group)"
        >
          {{ group.label }}
        </el-menu-item>
      </template>
    </el-menu>
    <div v-if="loading" class="menu-loading">菜单加载中...</div>
  </el-aside>
</template>

<style scoped>
.layout-aside {
  background: linear-gradient(180deg, #0f1f31 0%, #162d45 100%);
  color: #fff;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.logo {
  height: 68px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  object-fit: cover;
}

.logo-title {
  font-size: 16px;
  color: #f5f8ff;
  font-weight: 700;
}

.logo-sub {
  font-size: 12px;
  color: #93a7bf;
}

.menu-list {
  border-right: none;
  padding: 4px 8px;
}

:deep(.menu-list .el-sub-menu__title) {
  margin: 4px 0;
  border-radius: 8px;
}

:deep(.menu-list .el-menu-item) {
  margin: 4px 0;
  border-radius: 8px;
  padding-left: 44px;
}

:deep(.menu-list .el-menu-item:hover),
:deep(.menu-list .el-sub-menu__title:hover) {
  background: rgba(100, 166, 255, 0.14);
  color: #dcefff;
}

:deep(.menu-list .el-menu-item.is-active) {
  background: linear-gradient(90deg, #3d6eff 0%, #4ea5ff 100%);
  color: #fff;
}

.menu-loading {
  color: #9eb5ce;
  font-size: 12px;
  padding: 6px 16px;
}

@media (max-width: 900px) {
  .layout-aside {
    width: 72px !important;
  }

  .logo-text {
    display: none;
  }

  :deep(.menu-list .el-sub-menu__title span),
  :deep(.menu-list .el-menu-item span) {
    display: none;
  }
}
</style>