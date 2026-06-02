<template>
  <div class="page-shell">
    <a-card :bordered="false" class="page-panel">
      <div class="page-toolbar">
        <div class="page-title-block">
          <h2 class="page-title">角色管理</h2>
          <div class="page-subtitle">维护功能权限、数据权限和用户授权关系</div>
        </div>
        <div class="page-toolbar-main">
          <a-input v-model:value="query.roleName" class="toolbar-input" placeholder="角色名称" allow-clear @press-enter="loadData" />
          <a-button @click="loadData">
            <template #icon><SearchOutlined /></template>
            搜索
          </a-button>
          <a-button type="primary" v-has-permi="['system:role:add']" @click="openDialog()">
            <template #icon><PlusOutlined /></template>
            新增
          </a-button>
        </div>
      </div>

      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        row-key="roleId"
        :pagination="false"
        :scroll="{ x: 1120 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag class="status-tag" :color="record.status === 0 ? 'green' : 'red'">{{ record.status === 0 ? '正常' : '停用' }}</a-tag>
          </template>
          <template v-if="column.key === 'dataScope'">
            <a-tag :color="getDataScopeMeta(record.dataScope).color">
              {{ getDataScopeMeta(record.dataScope).label }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <div class="table-actions">
              <a-button type="link" size="small" v-has-permi="['system:role:edit']" @click="openDialog(record)">
                <template #icon><EditOutlined /></template>
                编辑
              </a-button>
              <a-button type="link" size="small" v-has-permi="['system:role:edit']" @click="openDataScopeDialog(record)">
                <template #icon><SafetyCertificateOutlined /></template>
                数据权限
              </a-button>
              <a-button type="link" size="small" v-has-permi="['system:role:edit']" @click="openUserDialog(record)">
                <template #icon><TeamOutlined /></template>
                分配用户
              </a-button>
              <a-button type="link" size="small" v-has-permi="['system:role:edit']" @click="openMenuDialog(record)">
                <template #icon><MenuOutlined /></template>
                绑定菜单
              </a-button>
              <a-popconfirm title="确认删除？" @confirm="handleDelete(record.roleId)">
                <a-button type="link" danger size="small" v-has-permi="['system:role:remove']">
                  <template #icon><DeleteOutlined /></template>
                  删除
                </a-button>
              </a-popconfirm>
            </div>
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

    <a-modal
      v-model:open="dataScopeDialogVisible"
      :title="`数据权限 - ${currentRoleName || ''}`"
      width="680px"
      :confirm-loading="dataScopeSubmitting"
      @ok="handleDataScopeSubmit"
    >
      <a-spin :spinning="dataScopeLoading">
        <a-form :label-col="{ span: 5 }">
          <a-form-item label="权限范围">
            <a-radio-group v-model:value="dataScopeValue" class="data-scope-options">
              <a-radio v-for="item in dataScopeOptions" :key="item.value" :value="item.value">
                <span class="data-scope-option">
                  <span class="data-scope-option-title">{{ item.label }}</span>
                  <span class="data-scope-option-desc">{{ item.description }}</span>
                </span>
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item v-if="dataScopeValue === 5" label="选择部门">
            <div class="data-scope-tree-toolbar">
              <a-tag color="blue">已选 {{ checkedDeptKeys.length }} 个部门</a-tag>
              <a-space>
                <a-button size="small" :disabled="!deptTree.length" @click="checkAllDepts">
                  <template #icon><CheckSquareOutlined /></template>
                  全选
                </a-button>
                <a-button size="small" :disabled="!checkedDeptKeys.length" @click="clearCheckedDepts">
                  <template #icon><DeleteOutlined /></template>
                  清空
                </a-button>
              </a-space>
            </div>
            <a-empty v-if="!deptTree.length" description="暂无部门数据" />
            <div v-else class="data-scope-tree">
              <a-tree
                checkable
                block-node
                default-expand-all
                :selectable="false"
                :tree-data="deptTree"
                :field-names="{ title: 'deptName', key: 'deptId', children: 'children' }"
                :checked-keys="checkedDeptKeys"
                @check="onDeptCheck"
              />
            </div>
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
import {
  CheckSquareOutlined,
  DeleteOutlined,
  EditOutlined,
  MenuOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  TeamOutlined
} from '@ant-design/icons-vue'
import { listRole, getRole, addRole, updateRole, deleteRole, bindRoleMenus, updateRoleDataScope, getRoleUsers, assignRoleUsers, getRoleMenus, getRoleDepts } from '@/api/role'
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
const dataScopeSubmitting = ref(false)
const dataScopeValue = ref(1)
const deptTree = ref([])
const checkedDeptKeys = ref([])
const userDialogVisible = ref(false)
const userLoading = ref(false)
const userTransferData = ref([])
const selectedUserKeys = ref([])
const query = reactive({ roleName: '' })
const form = reactive({ roleId: null, roleName: '', roleKey: '', status: 0 })
const dataScopeOptions = [
  { value: 1, label: '全部数据权限', description: '可访问所有部门数据', color: 'blue' },
  { value: 2, label: '本部门及以下', description: '当前部门和所有下级部门', color: 'cyan' },
  { value: 3, label: '本部门', description: '仅当前用户所属部门', color: 'green' },
  { value: 4, label: '仅本人', description: '仅当前用户自己的数据', color: 'orange' },
  { value: 5, label: '自定义部门', description: '从部门树中指定可见范围', color: 'purple' }
]
const rules = {
  roleName: [{ required: true, message: '请输入角色名称' }],
  roleKey: [{ required: true, message: '请输入权限标识' }]
}
const columns = [
  { title: 'ID', dataIndex: 'roleId', width: 80 },
  { title: '角色名称', dataIndex: 'roleName', width: 220, ellipsis: true },
  { title: '权限标识', dataIndex: 'roleKey', width: 240, ellipsis: true },
  { title: '数据权限', key: 'dataScope', width: 130, align: 'center' },
  { title: '状态', key: 'status', width: 90, align: 'center' },
  { title: '操作', key: 'action', width: 360, fixed: 'right' }
]

function getDataScopeMeta(value) {
  return dataScopeOptions.find(item => item.value === Number(value)) || { label: '未配置', color: 'default' }
}

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
  checkedDeptKeys.value = normalizeDeptKeys(keys)
}

function normalizeDeptKeys(keys) {
  const rawKeys = Array.isArray(keys) ? keys : keys?.checked || []
  return rawKeys.map(item => Number(item)).filter(item => Number.isFinite(item))
}

function flattenDeptIds(nodes, result = []) {
  ;(nodes || []).forEach(item => {
    if (item.deptId !== undefined && item.deptId !== null) {
      const deptId = Number(item.deptId)
      if (Number.isFinite(deptId)) result.push(deptId)
    }
    if (Array.isArray(item.children) && item.children.length) {
      flattenDeptIds(item.children, result)
    }
  })
  return result
}

function checkAllDepts() {
  checkedDeptKeys.value = flattenDeptIds(deptTree.value)
}

function clearCheckedDepts() {
  checkedDeptKeys.value = []
}

async function openDataScopeDialog(row) {
  currentRoleId.value = row.roleId
  currentRoleName.value = row.roleName || ''
  dataScopeValue.value = 1
  checkedDeptKeys.value = []
  dataScopeDialogVisible.value = true
  dataScopeLoading.value = true
  try {
    const [depts, role, deptIds] = await Promise.all([listDept(), getRole(row.roleId), getRoleDepts(row.roleId)])
    deptTree.value = Array.isArray(depts) ? depts : depts?.records || []
    dataScopeValue.value = Number(role?.dataScope ?? row.dataScope ?? 1)
    checkedDeptKeys.value = dataScopeValue.value === 5
      ? normalizeDeptKeys(Array.isArray(deptIds) ? deptIds : parseRoleDeptIds(role))
      : []
  } finally {
    dataScopeLoading.value = false
  }
}

async function handleDataScopeSubmit() {
  if (dataScopeValue.value === 5 && checkedDeptKeys.value.length === 0) {
    message.warning('请选择至少一个部门')
    return
  }

  const payload = {
    roleId: currentRoleId.value,
    dataScope: dataScopeValue.value,
    deptIds: dataScopeValue.value === 5 ? normalizeDeptKeys(checkedDeptKeys.value) : []
  }
  dataScopeSubmitting.value = true
  try {
    await updateRoleDataScope(payload)
  } catch (err) {
    if (err?.response?.status === 404) await updateRole(payload)
    else throw err
  } finally {
    dataScopeSubmitting.value = false
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

<style scoped>
.data-scope-options {
  display: grid;
  gap: 8px;
  width: 100%;
}

.data-scope-options :deep(.ant-radio-wrapper) {
  align-items: flex-start;
  width: 100%;
  margin-inline-end: 0;
  padding: 8px 10px;
  border: 1px solid var(--app-border);
  border-radius: 6px;
  background: var(--app-panel);
}

.data-scope-options :deep(.ant-radio-wrapper-checked) {
  border-color: #1f4fbf;
  background: var(--app-primary-soft);
}

.data-scope-option {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}

.data-scope-option-title {
  color: var(--app-text);
  font-weight: 500;
}

.data-scope-option-desc {
  margin-top: 2px;
  color: var(--app-text-muted);
  font-size: 12px;
}

.data-scope-tree-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.data-scope-tree {
  max-height: 320px;
  overflow: auto;
  padding: 8px;
  border: 1px solid var(--app-border);
  border-radius: 6px;
  background: var(--app-bg-soft);
}
</style>
