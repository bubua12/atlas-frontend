<template>
  <div class="page-shell">
    <div class="split-layout menu-layout">
    <a-card :bordered="false" class="page-panel side-panel">
      <div class="panel-heading">
        <div>
          <h3 class="panel-heading-title">菜单树</h3>
          <div class="panel-heading-desc">按目录层级筛选子菜单</div>
        </div>
      </div>
      <a-input-search
        v-model:value="searchText"
        placeholder="搜索菜单"
        style="margin-bottom:12px"
        allow-clear
      />
      <a-tree
        :tree-data="treeData"
        :field-names="{ title: 'menuName', key: 'menuId', children: 'children' }"
        :selected-keys="selectedKeys"
        default-expand-all
        @select="onTreeSelect"
      />
    </a-card>

    <a-card :bordered="false" class="page-panel content-panel">
      <div class="page-toolbar">
        <div class="page-title-block">
          <h2 class="page-title">{{ currentNodeName }}</h2>
          <div class="page-subtitle">维护菜单、按钮权限和路由入口</div>
        </div>
        <a-button type="primary" @click="openDialog()">
          <template #icon><PlusOutlined /></template>
          新增菜单
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="childList"
        :loading="loading"
        row-key="menuId"
        :pagination="false"
        :scroll="{ x: 1060 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'menuType'">
            <a-tag v-if="record.menuType === 'M'" color="blue">目录</a-tag>
            <a-tag v-else-if="record.menuType === 'C'" color="green">菜单</a-tag>
            <a-tag v-else color="orange">按钮</a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag class="status-tag" :color="record.status === 0 ? 'green' : 'red'">{{ record.status === 0 ? '正常' : '停用' }}</a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <div class="table-actions">
              <a-button type="link" size="small" @click="openDialog(record)">
                <template #icon><EditOutlined /></template>
                编辑
              </a-button>
              <a-button type="link" size="small" @click="openDialog({ parentId: record.menuId })">
                <template #icon><PlusOutlined /></template>
                新增子项
              </a-button>
              <a-popconfirm title="确认删除？" @confirm="handleDelete(record.menuId)">
                <a-button type="link" danger size="small">
                  <template #icon><DeleteOutlined /></template>
                  删除
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>
    </div>

    <a-modal v-model:open="dialogVisible" :title="form.menuId ? '编辑菜单' : '新增菜单'" @ok="handleSubmit" width="600px">
      <a-form :model="form" :rules="rules" ref="formRef" :label-col="{ span: 5 }">
        <a-form-item label="菜单名称" name="menuName">
          <a-input v-model:value="form.menuName" />
        </a-form-item>
        <a-form-item label="上级菜单">
          <a-tree-select
            v-model:value="form.parentId"
            :tree-data="[{ menuId: 0, menuName: '顶级菜单', children: allMenus }]"
            :field-names="{ label: 'menuName', value: 'menuId', children: 'children' }"
            placeholder="请选择上级菜单"
            tree-default-expand-all
          />
        </a-form-item>
        <a-form-item label="菜单类型">
          <a-radio-group v-model:value="form.menuType">
            <a-radio value="M">目录</a-radio>
            <a-radio value="C">菜单</a-radio>
            <a-radio value="F">按钮</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="路由地址">
          <a-input v-model:value="form.path" />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="form.sort" :min="0" />
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model:value="form.status">
            <a-radio :value="0">正常</a-radio>
            <a-radio :value="1">停用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { listMenu, addMenu, updateMenu, deleteMenu } from '@/api/menu'

const loading = ref(false)
const allMenus = ref([])
const selectedKeys = ref([])
const selectedParentId = ref(null)
const searchText = ref('')
const dialogVisible = ref(false)
const formRef = ref()
const defaultForm = { menuId: null, menuName: '', parentId: 0, menuType: 'M', path: '', sort: 0, status: 0 }
const form = reactive({ ...defaultForm })
const rules = { menuName: [{ required: true, message: '请输入菜单名称' }] }

const columns = [
  { title: '菜单名称', dataIndex: 'menuName', width: 200, ellipsis: true },
  { title: '图标', dataIndex: 'icon', width: 90, align: 'center' },
  { title: '排序', dataIndex: 'sort', width: 90, align: 'center' },
  { title: '路由地址', dataIndex: 'path', width: 240, ellipsis: true },
  { title: '类型', key: 'menuType', width: 90, align: 'center' },
  { title: '状态', key: 'status', width: 90, align: 'center' },
  { title: '操作', key: 'action', width: 240, fixed: 'right' }
]

// 只保留有子节点的节点（叶子节点不上树）
function pruneLeaves(nodes) {
  return nodes.reduce((acc, node) => {
    if (node.children?.length) {
      acc.push({ ...node, children: pruneLeaves(node.children) })
    }
    return acc
  }, [])
}

// 搜索过滤
function filterTree(nodes, keyword) {
  if (!keyword) return nodes
  return nodes.reduce((acc, node) => {
    const children = node.children ? filterTree(node.children, keyword) : []
    if (node.menuName.includes(keyword) || children.length) {
      acc.push({ ...node, children })
    }
    return acc
  }, [])
}

const treeData = computed(() => filterTree(pruneLeaves(allMenus.value), searchText.value))

// 当前选中节点名称
const currentNodeName = computed(() => {
  if (selectedParentId.value === null) return '全部菜单'
  const find = (nodes) => {
    for (const n of nodes) {
      if (n.menuId === selectedParentId.value) return n.menuName
      if (n.children) { const r = find(n.children); if (r) return r }
    }
  }
  return find(allMenus.value) || '全部菜单'
})

// 递归收集所有节点（扁平化）
function flattenTree(nodes) {
  return nodes.reduce((acc, n) => {
    acc.push(n)
    if (n.children) acc.push(...flattenTree(n.children))
    return acc
  }, [])
}

// 右侧列表：选中节点的直接子项，未选中时展示顶级
const childList = computed(() => {
  if (selectedParentId.value === null) return allMenus.value
  const all = flattenTree(allMenus.value)
  const node = all.find(n => n.menuId === selectedParentId.value)
  return node?.children || []
})

function onTreeSelect(keys) {
  if (keys.length) {
    selectedKeys.value = keys
    selectedParentId.value = keys[0]
  } else {
    selectedKeys.value = []
    selectedParentId.value = null
  }
}

async function loadData() {
  loading.value = true
  try {
    const res = await listMenu()
    allMenus.value = Array.isArray(res) ? res : []
  } finally {
    loading.value = false
  }
}

function openDialog(row) {
  Object.keys(form).forEach(k => delete form[k])
  const defaults = { ...defaultForm }
  if (!row && selectedParentId.value !== null) defaults.parentId = selectedParentId.value
  Object.assign(form, { ...defaults, ...row })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value.validate()
  const data = { ...form }
  if (!data.menuId) delete data.menuId
  try {
    data.menuId ? await updateMenu(data) : await addMenu(data)
    message.success('操作成功')
    dialogVisible.value = false
    loadData()
  } catch (e) { /* interceptor already shows error */ }
}

async function handleDelete(id) {
  await deleteMenu(id)
  message.success('删除成功')
  loadData()
}

onMounted(loadData)
</script>

<style scoped>
.menu-layout {
  grid-template-columns: minmax(260px, 300px) minmax(0, 1fr);
  min-height: calc(100vh - 112px);
}

@media (max-width: 1100px) {
  .menu-layout {
    grid-template-columns: 1fr;
  }
}
</style>
