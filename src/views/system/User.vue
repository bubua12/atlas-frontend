<template>
  <div>
    <a-card :bordered="false">
      <a-space style="margin-bottom:16px">
        <a-input v-model:value="query.username" placeholder="用户名" allow-clear />
        <a-button type="primary" @click="loadData">搜索</a-button>
        <a-button type="primary" ghost @click="openDialog()">新增</a-button>
      </a-space>

      <a-table :columns="columns" :data-source="tableData" :loading="loading" row-key="userId"
        :pagination="{ current: query.pageNum, pageSize: query.pageSize, total, showSizeChanger: true, pageSizeOptions: ['10','20','50'], onChange: onPageChange, onShowSizeChange: onPageChange }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 0 ? 'green' : 'red'">{{ record.status === 0 ? '正常' : '停用' }}</a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" size="small" @click="openDialog(record)">编辑</a-button>
            <a-button type="link" size="small" @click="openRoleDialog(record)">分配角色</a-button>
            <a-popconfirm title="确认删除？" @confirm="handleDelete(record.userId)">
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
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
          <a-checkbox-group v-model:value="form.roleIds" style="display:flex;flex-wrap:wrap;gap:12px">
            <a-checkbox v-for="item in roleOptions" :key="item.roleId" :value="item.roleId">
              {{ item.roleName }}
            </a-checkbox>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="roleDialogVisible" :title="`分配角色 - ${currentUserName || ''}`" @ok="handleRoleSubmit">
      <a-spin :spinning="roleLoading">
        <a-checkbox-group v-model:value="selectedRoleIds" style="display:flex;flex-wrap:wrap;gap:12px">
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
import { listUser, getUser, addUser, updateUser, deleteUser, assignUserRoles, getUserRoles } from '@/api/user'
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
  { title: '用户名', dataIndex: 'username' },
  { title: '昵称', dataIndex: 'nickname' },
  { title: '邮箱', dataIndex: 'email' },
  { title: '手机号', dataIndex: 'phone' },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 220 }
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

function parseUserRoleIds(user) {
  if (Array.isArray(user.roleIds)) return user.roleIds
  if (Array.isArray(user.roleIdList)) return user.roleIdList
  if (Array.isArray(user.roles)) return user.roles.map(item => item.roleId).filter(Boolean)
  if (Array.isArray(user.roleList)) return user.roleList.map(item => item.roleId).filter(Boolean)
  return []
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
