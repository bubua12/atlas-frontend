<template>
  <div>
    <a-card :bordered="false">
      <a-button type="primary" ghost style="margin-bottom:16px" @click="openDialog()">新增</a-button>

      <a-table :columns="columns" :data-source="tableData" :loading="loading"
        row-key="menuId" :pagination="false" default-expand-all-rows>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'menuType'">
            <a-tag v-if="record.menuType === 'M'" color="blue">目录</a-tag>
            <a-tag v-else-if="record.menuType === 'C'" color="green">菜单</a-tag>
            <a-tag v-else>按钮</a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 0 ? 'green' : 'red'">{{ record.status === 0 ? '正常' : '停用' }}</a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" size="small" @click="openDialog(record)">编辑</a-button>
            <a-button type="link" size="small" @click="openDialog({ parentId: record.menuId })">新增</a-button>
            <a-popconfirm title="确认删除？" @confirm="handleDelete(record.menuId)">
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="dialogVisible" :title="form.menuId ? '编辑菜单' : '新增菜单'" @ok="handleSubmit" width="600px">
      <a-form :model="form" :rules="rules" ref="formRef" :label-col="{ span: 5 }">
        <a-form-item label="菜单名称" name="menuName">
          <a-input v-model:value="form.menuName" />
        </a-form-item>
        <a-form-item label="上级菜单">
          <a-input v-model:value="form.parentId" placeholder="0为顶级" />
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
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { listMenu, addMenu, updateMenu, deleteMenu } from '@/api/menu'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const formRef = ref()
const defaultForm = { menuId: null, menuName: '', parentId: 0, menuType: 'M', path: '', sort: 0, status: 0 }
const form = reactive({ ...defaultForm })
const rules = { menuName: [{ required: true, message: '请输入菜单名称' }] }
const columns = [
  { title: '菜单名称', dataIndex: 'menuName' },
  { title: '图标', dataIndex: 'icon', width: 80 },
  { title: '排序', dataIndex: 'sort', width: 80 },
  { title: '路由地址', dataIndex: 'path' },
  { title: '类型', key: 'menuType', width: 80 },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 200 }
]

async function loadData() {
  loading.value = true
  try {
    const res = await listMenu()
    tableData.value = Array.isArray(res) ? res : []
  } finally {
    loading.value = false
  }
}

function openDialog(row) {
  Object.keys(form).forEach(k => delete form[k])
  Object.assign(form, { ...defaultForm, ...row })
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
