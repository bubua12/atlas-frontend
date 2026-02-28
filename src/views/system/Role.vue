<template>
  <div>
    <a-card :bordered="false">
      <a-space style="margin-bottom:16px">
        <a-input v-model:value="query.roleName" placeholder="角色名称" allow-clear />
        <a-button type="primary" @click="loadData">搜索</a-button>
        <a-button type="primary" ghost @click="openDialog()">新增</a-button>
      </a-space>

      <a-table :columns="columns" :data-source="tableData" :loading="loading" row-key="roleId" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 0 ? 'green' : 'red'">{{ record.status === 0 ? '正常' : '停用' }}</a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" size="small" @click="openDialog(record)">编辑</a-button>
            <a-popconfirm title="确认删除？" @confirm="handleDelete(record.roleId)">
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="dialogVisible" :title="form.roleId ? '编辑角色' : '新增角色'" @ok="handleSubmit">
      <a-form :model="form" :rules="rules" ref="formRef" :label-col="{ span: 5 }">
        <a-form-item label="角色名称" name="roleName">
          <a-input v-model:value="form.roleName" />
        </a-form-item>
        <a-form-item label="权限标识" name="roleKey">
          <a-input v-model:value="form.roleKey" />
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
import { listRole, addRole, updateRole, deleteRole } from '@/api/role'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const formRef = ref()
const query = reactive({ roleName: '' })
const form = reactive({ roleId: null, roleName: '', roleKey: '', status: 0 })
const rules = {
  roleName: [{ required: true, message: '请输入角色名称' }],
  roleKey: [{ required: true, message: '请输入权限标识' }]
}
const columns = [
  { title: 'ID', dataIndex: 'roleId', width: 80 },
  { title: '角色名称', dataIndex: 'roleName' },
  { title: '权限标识', dataIndex: 'roleKey' },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 160 }
]

async function loadData() {
  loading.value = true
  try {
    const res = await listRole(query)
    tableData.value = Array.isArray(res) ? res : res.records || []
  } finally {
    loading.value = false
  }
}

function openDialog(row) {
  Object.keys(form).forEach(k => delete form[k])
  Object.assign(form, row || { roleId: null, roleName: '', roleKey: '', status: 0 })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value.validate()
  const data = { ...form }
  if (!data.roleId) delete data.roleId
  try {
    data.roleId ? await updateRole(data) : await addRole(data)
    message.success('操作成功')
    dialogVisible.value = false
    loadData()
  } catch (e) { /* interceptor already shows error */ }
}

async function handleDelete(id) {
  await deleteRole(id)
  message.success('删除成功')
  loadData()
}

onMounted(loadData)
</script>
