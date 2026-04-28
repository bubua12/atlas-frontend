<template>
  <div class="page-shell">
    <a-card :bordered="false" class="page-panel">
      <div class="page-toolbar">
        <div class="page-title-block">
          <h2 class="page-title">用户管理</h2>
          <div class="page-subtitle">维护用户账号、状态和角色绑定</div>
        </div>
        <div class="page-toolbar-main">
          <a-input v-model:value="query.username" class="toolbar-input" placeholder="用户名" allow-clear @press-enter="loadData" />
          <a-button @click="loadData">
            <template #icon><SearchOutlined /></template>
            搜索
          </a-button>
          <a-button type="primary" @click="openDialog()">
            <template #icon><PlusOutlined /></template>
            新增
          </a-button>
        </div>
      </div>

      <a-table :columns="columns" :data-source="tableData" :loading="loading" row-key="userId"
        :scroll="{ x: 1120 }"
        :pagination="{ current: query.pageNum, pageSize: query.pageSize, total, showSizeChanger: true, pageSizeOptions: ['10','20','50'], onChange: onPageChange, onShowSizeChange: onPageChange }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag class="status-tag" :color="record.status === 0 ? 'green' : 'red'">{{ record.status === 0 ? '正常' : '停用' }}</a-tag>
          </template>
          <template v-if="column.key === 'email'">
            <span :class="{ 'muted-text': !record.email }">{{ record.email || '-' }}</span>
          </template>
          <template v-if="column.key === 'phone'">
            <span :class="{ 'muted-text': !record.phone }">{{ record.phone || '-' }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <div class="table-actions">
              <a-button type="link" size="small" @click="openDialog(record)">
                <template #icon><EditOutlined /></template>
                编辑
              </a-button>
              <a-button type="link" size="small" @click="openRoleDialog(record)">
                <template #icon><TeamOutlined /></template>
                分配角色
              </a-button>
              <a-popconfirm title="确认删除？" @confirm="handleDelete(record.userId)">
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

    <a-modal v-model:open="dialogVisible" :title="form.userId ? '编辑用户' : '新增用户'" @ok="handleSubmit">
      <a-form :model="form" :rules="rules" ref="formRef" :label-col="{ span: 4 }">
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="form.username" />
        </a-form-item>
        <a-form-item label="昵称" name="nickname">
          <a-input v-model:value="form.nickname" />
        </a-form-item>
        <a-form-item label="密码" name="password" v-if="!form.userId">
          <a-input-password v-model:value="form.password" />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input v-model:value="form.email" />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input v-model:value="form.phone" />
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model:value="form.status">
            <a-radio :value="0">正常</a-radio>
            <a-radio :value="1">停用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="角色" v-if="form.userId">
          <a-checkbox-group v-model:value="form.roleIds" class="selection-list">
            <a-checkbox v-for="item in roleOptions" :key="item.roleId" :value="item.roleId">
              {{ item.roleName }}
            </a-checkbox>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="roleDialogVisible" :title="`分配角色 - ${currentUserName || ''}`" @ok="handleRoleSubmit">
      <a-spin :spinning="roleLoading">
        <a-checkbox-group v-model:value="selectedRoleIds" class="selection-list">
          <a-checkbox v-for="item in roleOptions" :key="item.roleId" :value="item.roleId">
            {{ item.roleName }}
          </a-checkbox>
        </a-checkbox-group>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { listUser, addUser, updateUser, deleteUser, assignUserRoles, getUserRoles } from '@/api/user'
import { listRole } from '@/api/role'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const formRef = ref()
const roleDialogVisible = ref(false)
const roleLoading = ref(false)
const currentUserId = ref(null)
const currentUserName = ref('')
const roleOptions = ref([])
const selectedRoleIds = ref([])
const query = reactive({ username: '', pageNum: 1, pageSize: 10 })
const form = reactive({ userId: null, username: '', nickname: '', password: '', email: '', phone: '', status: 0, roleIds: [] })
const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  nickname: [{ required: true, message: '请输入昵称' }],
  password: [{ required: true, message: '请输入密码' }]
}
const columns = [
  { title: 'ID', dataIndex: 'userId', width: 80 },
  { title: '用户名', dataIndex: 'username', width: 160, ellipsis: true },
  { title: '昵称', dataIndex: 'nickname', width: 160, ellipsis: true },
  { title: '邮箱', key: 'email', dataIndex: 'email', width: 260, ellipsis: true },
  { title: '手机号', key: 'phone', dataIndex: 'phone', width: 150 },
  { title: '状态', key: 'status', width: 90, align: 'center' },
  { title: '操作', key: 'action', width: 220, fixed: 'right' }
]

function onPageChange(page, size) {
  query.pageNum = page
  query.pageSize = size
  loadData()
}

async function loadData() {
  loading.value = true
  try {
    const res = await listUser(query)
    tableData.value = res.records
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function openDialog(row) {
  Object.keys(form).forEach(k => delete form[k])
  Object.assign(form, row || { userId: null, username: '', nickname: '', password: '', email: '', phone: '', status: 0, roleIds: [] })
  if (row?.userId) {
    const [roles, userRoleIds] = await Promise.all([listRole(), getUserRoles(row.userId)])
    roleOptions.value = Array.isArray(roles) ? roles : roles?.records || []
    form.roleIds = Array.isArray(userRoleIds) ? userRoleIds : []
  }
  dialogVisible.value = true
}

async function openRoleDialog(row) {
  currentUserId.value = row.userId
  currentUserName.value = row.nickname || row.username || ''
  selectedRoleIds.value = []
  roleDialogVisible.value = true
  roleLoading.value = true
  try {
    const [roles, userRoleIds] = await Promise.all([listRole(), getUserRoles(row.userId)])
    roleOptions.value = Array.isArray(roles) ? roles : roles?.records || []
    selectedRoleIds.value = Array.isArray(userRoleIds) ? userRoleIds : []
  } finally {
    roleLoading.value = false
  }
}

async function handleRoleSubmit() {
  const payload = { userId: currentUserId.value, roleIds: selectedRoleIds.value }
  try {
    await assignUserRoles(payload)
  } catch (err) {
    if (err?.response?.status === 404) await updateUser(payload)
    else throw err
  }
  message.success('角色分配成功')
  roleDialogVisible.value = false
  loadData()
}

async function handleSubmit() {
  await formRef.value.validate()
  const data = { ...form }
  if (!data.userId) delete data.userId
  try {
    if (data.userId) {
      const { roleIds, ...userData } = data
      await updateUser(userData)
      if (roleIds) await assignUserRoles({ userId: data.userId, roleIds })
    } else {
      await addUser(data)
    }
    message.success('操作成功')
    dialogVisible.value = false
    loadData()
  } catch (e) { /* interceptor already shows error */ }
}

async function handleDelete(id) {
  await deleteUser(id)
  message.success('删除成功')
  loadData()
}

onMounted(loadData)
</script>
