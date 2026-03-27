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
            <a-button type="link" size="small" @click="openDataScopeDialog(record)">数据权限</a-button>
            <a-button type="link" size="small" @click="openUserDialog(record)">分配用户</a-button>
            <a-button type="link" size="small" @click="openMenuDialog(record)">绑定菜单</a-button>
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

    <a-modal v-model:open="menuDialogVisible" :title="`绑定菜单 - ${currentRoleName || ''}`" @ok="handleMenuSubmit">
      <a-spin :spinning="menuLoading">
        <a-tree
          checkable
          default-expand-all
          :tree-data="menuTree"
          :field-names="{ title: 'menuName', key: 'menuId', children: 'children' }"
          v-model:checkedKeys="checkedMenuKeys"
        />
      </a-spin>
    </a-modal>

    <a-modal v-model:open="dataScopeDialogVisible" :title="`数据权限 - ${currentRoleName || ''}`" @ok="handleDataScopeSubmit">
      <a-spin :spinning="dataScopeLoading">
        <a-form :label-col="{ span: 5 }">
          <a-form-item label="权限范围">
            <a-radio-group v-model:value="dataScopeValue">
              <a-radio :value="1">全部数据权限</a-radio>
              <a-radio :value="2">本部门及以下</a-radio>
              <a-radio :value="3">本部门</a-radio>
              <a-radio :value="4">仅本人</a-radio>
              <a-radio :value="5">自定义</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item v-if="dataScopeValue === 5" label="选择部门">
            <a-tree
              checkable
              default-expand-all
              :tree-data="deptTree"
              :field-names="{ title: 'deptName', key: 'deptId', children: 'children' }"
              :checked-keys="checkedDeptKeys"
              @check="onDeptCheck"
            />
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>

    <a-modal v-model:open="userDialogVisible" :title="`分配用户 - ${currentRoleName || ''}`" @ok="handleUserSubmit" width="780px">
      <a-spin :spinning="userLoading">
        <a-transfer
          v-model:target-keys="selectedUserKeys"
          :data-source="userTransferData"
          :titles="['可选用户', '已选用户']"
          :render="item => item.title"
          :list-style="{ width: '330px', height: '420px' }"
          :show-search="true"
          :filter-option="userFilterOption"
          :locale="{ itemUnit: '人', itemsUnit: '人', searchPlaceholder: '搜索用户名/手机号' }"
        />
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { listRole, getRole, addRole, updateRole, deleteRole, bindRoleMenus, updateRoleDataScope, getRoleUsers, assignRoleUsers, getRoleMenus } from '@/api/role'
import { listMenu } from '@/api/menu'
import { listDept } from '@/api/dept'
import { listUser } from '@/api/user'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const formRef = ref()
const menuDialogVisible = ref(false)
const menuLoading = ref(false)
const currentRoleId = ref(null)
const currentRoleName = ref('')
const menuTree = ref([])
const checkedMenuKeys = ref([])
const dataScopeDialogVisible = ref(false)
const dataScopeLoading = ref(false)
const dataScopeValue = ref(1)
const deptTree = ref([])
const checkedDeptKeys = ref([])
const userDialogVisible = ref(false)
const userLoading = ref(false)
const userTransferData = ref([])
const selectedUserKeys = ref([])
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
  { title: '操作', key: 'action', width: 320 }
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

function parseRoleMenuIds(role) {
  if (Array.isArray(role.menuIds)) return role.menuIds
  if (Array.isArray(role.menuIdList)) return role.menuIdList
  if (Array.isArray(role.menus)) return role.menus.map(item => item.menuId).filter(Boolean)
  if (Array.isArray(role.menuList)) return role.menuList.map(item => item.menuId).filter(Boolean)
  return []
}

function parseRoleDeptIds(role) {
  if (Array.isArray(role.deptIds)) return role.deptIds
  if (Array.isArray(role.deptIdList)) return role.deptIdList
  if (Array.isArray(role.depts)) return role.depts.map(item => item.deptId).filter(Boolean)
  if (Array.isArray(role.deptList)) return role.deptList.map(item => item.deptId).filter(Boolean)
  return []
}

function parseRoleUserIds(data) {
  if (Array.isArray(data)) {
    if (!data.length) return []
    if (typeof data[0] === 'number' || typeof data[0] === 'string') return data
    return data.map(item => item.userId).filter(Boolean)
  }
  if (Array.isArray(data.userIds)) return data.userIds
  if (Array.isArray(data.userIdList)) return data.userIdList
  if (Array.isArray(data.users)) return data.users.map(item => item.userId).filter(Boolean)
  if (Array.isArray(data.userList)) return data.userList.map(item => item.userId).filter(Boolean)
  if (Array.isArray(data.records)) return data.records.map(item => item.userId).filter(Boolean)
  return []
}

function userFilterOption(inputValue, option) {
  const keyword = inputValue.trim().toLowerCase()
  if (!keyword) return true
  const username = String(option.username || '').toLowerCase()
  const nickname = String(option.nickname || '').toLowerCase()
  const phone = String(option.phone || '').toLowerCase()
  return username.includes(keyword) || nickname.includes(keyword) || phone.includes(keyword)
}

function onDeptCheck(keys) {
  checkedDeptKeys.value = Array.isArray(keys) ? keys : keys.checked
}

async function openDataScopeDialog(row) {
  currentRoleId.value = row.roleId
  currentRoleName.value = row.roleName || ''
  dataScopeValue.value = 1
  checkedDeptKeys.value = []
  dataScopeDialogVisible.value = true
  dataScopeLoading.value = true
  try {
    const [depts, role] = await Promise.all([listDept(), getRole(row.roleId)])
    deptTree.value = Array.isArray(depts) ? depts : depts?.records || []
    dataScopeValue.value = role?.dataScope ?? 1
    checkedDeptKeys.value = parseRoleDeptIds(role)
  } finally {
    dataScopeLoading.value = false
  }
}

async function handleDataScopeSubmit() {
  const payload = { roleId: currentRoleId.value, dataScope: dataScopeValue.value, deptIds: checkedDeptKeys.value.map(item => Number(item)) }
  try {
    await updateRoleDataScope(payload)
  } catch (err) {
    if (err?.response?.status === 404) await updateRole(payload)
    else throw err
  }
  message.success('数据权限配置成功')
  dataScopeDialogVisible.value = false
  loadData()
}

async function loadAllUsers() {
  const all = []
  let pageNum = 1
  const pageSize = 200
  while (true) {
    const res = await listUser({ pageNum, pageSize })
    const records = Array.isArray(res) ? res : res?.records || []
    all.push(...records)
    const total = Array.isArray(res) ? records.length : res?.total ?? records.length
    if (all.length >= total || records.length < pageSize) break
    pageNum += 1
  }
  return all
}

async function openUserDialog(row) {
  currentRoleId.value = row.roleId
  currentRoleName.value = row.roleName || ''
  selectedUserKeys.value = []
  userDialogVisible.value = true
  userLoading.value = true
  try {
    const [users, roleUsers, role] = await Promise.all([
      loadAllUsers(),
      getRoleUsers(row.roleId).catch(() => ({})),
      getRole(row.roleId)
    ])
    const enabledUsers = users.filter(item => Number(item.status) === 0)
    userTransferData.value = enabledUsers.map(item => ({
      key: String(item.userId),
      title: `${item.nickname || item.username}（${item.username}）`,
      description: item.email || item.phone || '',
      username: item.username,
      nickname: item.nickname,
      phone: item.phone
    }))
    const validUserIdSet = new Set(userTransferData.value.map(item => item.key))
    const selected = parseRoleUserIds(roleUsers)
    selectedUserKeys.value = (selected.length ? selected : parseRoleUserIds(role))
      .map(item => String(item))
      .filter(item => validUserIdSet.has(item))
  } finally {
    userLoading.value = false
  }
}

async function handleUserSubmit() {
  const payload = {
    roleId: currentRoleId.value,
    userIds: selectedUserKeys.value.map(item => Number(item))
  }
  try {
    await assignRoleUsers(payload)
  } catch (err) {
    if (err?.response?.status === 404) await updateRole(payload)
    else throw err
  }
  message.success('用户分配成功')
  userDialogVisible.value = false
}

async function openMenuDialog(row) {
  currentRoleId.value = row.roleId
  currentRoleName.value = row.roleName || ''
  checkedMenuKeys.value = []
  menuDialogVisible.value = true
  menuLoading.value = true
  try {
    const [menus, menuIds] = await Promise.all([listMenu(), getRoleMenus(row.roleId)])
    menuTree.value = Array.isArray(menus) ? menus : menus?.records || []
    checkedMenuKeys.value = Array.isArray(menuIds) ? menuIds : []
  } finally {
    menuLoading.value = false
  }
}

async function handleMenuSubmit() {
  const payload = {
    roleId: currentRoleId.value,
    menuIds: checkedMenuKeys.value.map(item => Number(item))
  }
  try {
    await bindRoleMenus(payload)
  } catch (err) {
    if (err?.response?.status === 404) await updateRole(payload)
    else throw err
  }
  message.success('菜单绑定成功')
  menuDialogVisible.value = false
  loadData()
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
