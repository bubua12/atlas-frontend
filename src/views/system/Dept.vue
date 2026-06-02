<template>
  <div class="page-shell">
    <a-card :bordered="false" class="page-panel">
      <div class="page-toolbar">
        <div class="page-title-block">
          <h2 class="page-title">部门管理</h2>
          <div class="page-subtitle">维护组织层级、排序和启停状态</div>
        </div>
        <a-button type="primary" v-has-permi="['system:dept:add']" @click="openDialog()">
          <template #icon><PlusOutlined /></template>
          新增部门
        </a-button>
      </div>

      <a-table :columns="columns" :data-source="tableData" :loading="loading"
        :scroll="{ x: 820 }"
        row-key="deptId" :pagination="false" default-expand-all-rows>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag class="status-tag" :color="record.status === 0 ? 'green' : 'red'">{{ record.status === 0 ? '正常' : '停用' }}</a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <div class="table-actions">
              <a-button type="link" size="small" v-has-permi="['system:dept:edit']" @click="openDialog(record)">
                <template #icon><EditOutlined /></template>
                编辑
              </a-button>
              <a-button type="link" size="small" v-has-permi="['system:dept:add']" @click="openDialog({ parentId: record.deptId })">
                <template #icon><PlusOutlined /></template>
                新增下级
              </a-button>
              <a-popconfirm title="确认删除？" @confirm="handleDelete(record.deptId)">
                <a-button type="link" danger size="small" v-has-permi="['system:dept:remove']">
                  <template #icon><DeleteOutlined /></template>
                  删除
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="dialogVisible" :title="form.deptId ? '编辑部门' : '新增部门'" @ok="handleSubmit" width="500px">
      <a-form :model="form" :rules="rules" ref="formRef" :label-col="{ span: 5 }">
        <a-form-item label="部门名称" name="deptName">
          <a-input v-model:value="form.deptName" />
        </a-form-item>
        <a-form-item label="上级部门">
          <a-tree-select
            v-model:value="form.parentId"
            :tree-data="[{ deptId: 0, deptName: '顶级部门', children: tableData }]"
            :field-names="{ label: 'deptName', value: 'deptId', children: 'children' }"
            placeholder="请选择上级部门"
            tree-default-expand-all
          />
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
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { listDept, addDept, updateDept, deleteDept } from '@/api/dept'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const formRef = ref()
const defaultForm = { deptId: null, deptName: '', parentId: 0, sort: 0, status: 0 }
const form = reactive({ ...defaultForm })
const rules = { deptName: [{ required: true, message: '请输入部门名称' }] }
const columns = [
  { title: '部门名称', dataIndex: 'deptName', width: 360, ellipsis: true },
  { title: '排序', dataIndex: 'sort', width: 90, align: 'center' },
  { title: '状态', key: 'status', width: 90, align: 'center' },
  { title: '操作', key: 'action', width: 230, fixed: 'right' }
]

async function loadData() {
  loading.value = true
  try {
    const res = await listDept()
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
  if (!data.deptId) delete data.deptId
  try {
    data.deptId ? await updateDept(data) : await addDept(data)
    message.success('操作成功')
    dialogVisible.value = false
    loadData()
  } catch (e) { /* interceptor already shows error */ }
}

async function handleDelete(id) {
  await deleteDept(id)
  message.success('删除成功')
  loadData()
}

onMounted(loadData)
</script>
