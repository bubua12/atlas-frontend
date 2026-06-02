<template>
  <div class="page-shell">
    <a-card :bordered="false" class="page-panel">
      <div class="page-toolbar">
        <div class="page-title-block">
          <h2 class="page-title">公告管理</h2>
          <div class="page-subtitle">管理系统公告的发布、编辑和撤回</div>
        </div>
        <div class="page-toolbar-main">
          <a-select v-model:value="queryForm.status" placeholder="状态筛选" allow-clear
                    style="width: 120px;" @change="loadData">
            <a-select-option :value="0">草稿</a-select-option>
            <a-select-option :value="1">已发布</a-select-option>
            <a-select-option :value="2">已撤回</a-select-option>
          </a-select>
          <a-button type="primary" v-has-permi="['message:announce:add']" @click="openDialog()">
            <PlusOutlined /> 发布公告
          </a-button>
        </div>
      </div>

      <a-table :columns="columns" :data-source="dataList" :loading="loading"
               :pagination="pagination" row-key="messageId" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'messageType'">
            <a-tag :color="typeColorMap[record.messageType]">
              {{ typeLabelMap[record.messageType] }}
            </a-tag>
          </template>
          <template v-if="column.key === 'sendScope'">
            {{ scopeLabelMap[record.sendScope] }}
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="statusColorMap[record.status]">
              {{ statusLabelMap[record.status] }}
            </a-tag>
          </template>
          <template v-if="column.key === 'readProgress'">
            <span>{{ record.readCount }} / {{ record.totalCount }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a v-if="record.status === 0 || record.status === 1" v-has-permi="['message:announce:edit']" @click="openDialog(record)">编辑</a>
              <a v-if="record.status === 1" v-has-permi="['message:announce:edit']" @click="handleRevoke(record)">撤回</a>
              <a v-has-permi="['message:announce:remove']" style="color: #ff4d4f;" @click="handleDelete(record)">删除</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 创建/编辑公告弹窗 -->
    <a-modal v-model:open="dialogVisible"
             :title="form.messageId ? '编辑公告' : '发布公告'"
             @ok="handleSubmit" :confirm-loading="submitLoading"
             width="1000px" :mask-closable="false">
      <a-form :model="form" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }" label-align="left">
        <a-form-item label="标题" required>
          <a-input v-model:value="form.title" placeholder="请输入公告标题" :maxlength="200" />
        </a-form-item>
        <a-form-item label="类型" required>
          <a-select v-model:value="form.messageType">
            <a-select-option value="ANNOUNCEMENT">系统公告</a-select-option>
            <a-select-option value="SYSTEM">系统通知</a-select-option>
            <a-select-option value="ALERT">安全告警</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="发送范围">
          <a-select v-model:value="form.sendScope" @change="form.scopeValue = null; selectedIds = []">
            <a-select-option value="ALL">全员</a-select-option>
            <a-select-option value="ROLE">指定角色</a-select-option>
            <a-select-option value="DEPT">指定部门</a-select-option>
            <a-select-option value="USER">指定用户</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="form.sendScope !== 'ALL'" label="选择范围" required>
          <!-- 角色：checkbox 卡片列表 -->
          <div v-if="form.sendScope === 'ROLE'">
            <a-spin :spinning="roleLoading">
              <a-empty v-if="!roleOptions.length && !roleLoading" description="暂无角色数据" />
              <a-checkbox-group v-else v-model:value="selectedIds" class="selection-list">
                <a-checkbox v-for="item in roleOptions" :key="item.roleId" :value="item.roleId">
                  {{ item.roleName }}
                </a-checkbox>
              </a-checkbox-group>
            </a-spin>
          </div>
          <!-- 部门：可勾选树 -->
          <div v-else-if="form.sendScope === 'DEPT'">
            <div class="scope-tree-toolbar">
              <a-tag color="blue">已选 {{ selectedIds.length }} 个部门</a-tag>
              <a-space>
                <a-button size="small" :disabled="!deptTree.length" @click="checkAllDepts">
                  <template #icon><CheckSquareOutlined /></template> 全选
                </a-button>
                <a-button size="small" :disabled="!selectedIds.length" @click="selectedIds = []">
                  <template #icon><DeleteOutlined /></template> 清空
                </a-button>
              </a-space>
            </div>
            <a-empty v-if="!deptTree.length" description="暂无部门数据" />
            <div v-else class="scope-tree">
              <a-tree checkable block-node default-expand-all :selectable="false"
                      :tree-data="deptTree"
                      :field-names="{ title: 'deptName', key: 'deptId', children: 'children' }"
                      :checked-keys="selectedIds" @check="onDeptCheck" />
            </div>
          </div>
          <!-- 用户：弹窗选择 -->
          <div v-else-if="form.sendScope === 'USER'">
            <a-space>
              <a-button @click="openUserPicker">
                <template #icon><PlusOutlined /></template>
                选择用户
              </a-button>
              <a-tag v-if="selectedIds.length" color="blue">已选 {{ selectedIds.length }} 个用户</a-tag>
            </a-space>
            <div v-if="selectedUserNames.length" style="margin-top: 8px;">
              <a-tag v-for="name in selectedUserNames" :key="name" closable
                     @close="removeSelectedUser(name)" style="margin-bottom: 4px;">
                {{ name }}
              </a-tag>
            </div>
          </div>
        </a-form-item>
        <a-form-item label="内容">
          <div class="editor-wrapper">
            <div class="editor-toolbar">
              <a-button size="small" @click="previewMode = !previewMode">
                <template #icon><EyeOutlined v-if="!previewMode" /><EditOutlined v-else /></template>
                {{ previewMode ? '返回编辑' : '预览' }}
              </a-button>
            </div>
            <MdEditor v-if="!previewMode" v-model="form.content" :height="400" language="zh-CN"
                      :preview="false" :toolbarsExclude="['github', 'preview']" />
            <MdPreview v-else :modelValue="form.content" language="zh-CN" :height="400" />
          </div>
        </a-form-item>
        <a-form-item label="置顶">
          <a-switch v-model:checked="form.isTop" :checked-value="1" :unchecked-value="0" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 用户选择弹窗 -->
    <a-modal v-model:open="userPickerVisible" title="选择用户" width="640px"
             :body-style="{ padding: '12px 24px' }" @cancel="userPickerVisible = false"
             :mask-closable="false">
      <a-input-search v-model:value="userSearchKey" placeholder="搜索用户名/昵称"
                      style="margin-bottom: 12px;" @search="loadUsers" allow-clear />
      <a-table :columns="userColumns" :data-source="userList" :loading="userLoading"
               size="small" row-key="userId" :pagination="userPagination"
               :row-selection="{ selectedRowKeys: tempUserIds, onChange: keys => tempUserIds = keys }"
               @change="handleUserTableChange" />
      <template #footer>
        <a-button @click="userPickerVisible = false">取消</a-button>
        <a-button type="primary" @click="confirmUserSelect">确认（{{ tempUserIds.length }}）</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined, EyeOutlined, EditOutlined, CheckSquareOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { listAnnounces, createAnnounce, updateAnnounce, revokeAnnounce, deleteAnnounce } from '@/api/message'
import { listRole } from '@/api/role'
import { listDept } from '@/api/dept'
import { listUser } from '@/api/user'
import { MdEditor, MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const loading = ref(false)
const submitLoading = ref(false)
const dataList = ref([])
const dialogVisible = ref(false)
const previewMode = ref(false)
const selectedIds = ref([])
const roleOptions = ref([])
const deptTree = ref([])
const roleLoading = ref(false)
const userPickerVisible = ref(false)
const userSearchKey = ref('')
const userList = ref([])
const userLoading = ref(false)
const selectedUserNames = ref([])
const userMap = ref({})
const tempUserIds = ref([])

const queryForm = reactive({
  status: undefined
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`
})

const form = reactive({
  messageId: null,
  title: '',
  content: '',
  messageType: 'ANNOUNCEMENT',
  sendScope: 'ALL',
  scopeValue: null,
  isTop: 0,
  scheduledTime: null
})

const typeLabelMap = { ANNOUNCEMENT: '系统公告', SYSTEM: '系统通知', ALERT: '安全告警' }
const typeColorMap = { ANNOUNCEMENT: 'blue', SYSTEM: 'green', ALERT: 'red' }
const scopeLabelMap = { ALL: '全员', ROLE: '指定角色', DEPT: '指定部门', USER: '指定用户' }
const statusLabelMap = { 0: '草稿', 1: '已发布', 2: '已撤回' }
const statusColorMap = { 0: 'default', 1: 'green', 2: 'orange' }

watch(selectedIds, (ids) => {
  form.scopeValue = ids.length ? JSON.stringify(ids) : null
})

const columns = [
  { title: '标题', dataIndex: 'title', ellipsis: true },
  { title: '类型', key: 'messageType', dataIndex: 'messageType', width: 100 },
  { title: '发送范围', key: 'sendScope', dataIndex: 'sendScope', width: 100 },
  { title: '已读/投递', key: 'readProgress', width: 100 },
  { title: '状态', key: 'status', dataIndex: 'status', width: 80 },
  { title: '发布时间', dataIndex: 'publishTime', width: 160 },
  { title: '操作', key: 'action', width: 160 }
]

const userColumns = [
  { title: '用户名', dataIndex: 'username', width: 120 },
  { title: '昵称', dataIndex: 'nickname', width: 120 },
  { title: '部门', dataIndex: 'deptId', width: 80 },
  { title: '状态', key: 'status', width: 80 }
]

const userPagination = reactive({
  current: 1,
  pageSize: 8,
  total: 0,
  showSizeChanger: false,
  showTotal: (total) => `共 ${total} 条`
})

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      ...queryForm
    }
    const res = await listAnnounces(params)
    dataList.value = res.records || []
    pagination.total = res.total || 0
  } catch (e) {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

function handleTableChange(pag) {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

function openDialog(record) {
  previewMode.value = false
  selectedIds.value = []
  selectedUserNames.value = []
  if (record) {
    Object.assign(form, {
      messageId: record.messageId,
      title: record.title,
      content: record.content,
      messageType: record.messageType,
      sendScope: record.sendScope || 'ALL',
      scopeValue: record.scopeValue,
      isTop: record.isTop,
      scheduledTime: record.scheduledTime
    })
    if (record.scopeValue) {
      try { selectedIds.value = JSON.parse(record.scopeValue) } catch { selectedIds.value = [] }
    }
    if (form.sendScope === 'USER' && selectedIds.value.length) {
      loadSelectedUserNames(selectedIds.value)
    }
  } else {
    Object.assign(form, {
      messageId: null, title: '', content: '', messageType: 'ANNOUNCEMENT',
      sendScope: 'ALL', scopeValue: null, isTop: 0, scheduledTime: null
    })
  }
  dialogVisible.value = true
  loadSelectorOptions()
}

async function loadSelectorOptions() {
  roleLoading.value = true
  try {
    const [roles, depts] = await Promise.all([listRole(), listDept()])
    roleOptions.value = Array.isArray(roles) ? roles : roles?.records || []
    deptTree.value = Array.isArray(depts) ? depts : []
  } finally {
    roleLoading.value = false
  }
}

function openUserPicker() {
  tempUserIds.value = [...selectedIds.value]
  userSearchKey.value = ''
  userPagination.current = 1
  loadUsers()
  userPickerVisible.value = true
}

async function loadUsers() {
  userLoading.value = true
  try {
    const params = { pageNum: userPagination.current, pageSize: userPagination.pageSize }
    if (userSearchKey.value) params.username = userSearchKey.value
    const res = await listUser(params)
    userList.value = (res.records || []).map(u => ({ ...u, key: u.userId }))
    userPagination.total = res.total || 0
    // cache user names for display
    ;(res.records || []).forEach(u => { userMap.value[u.userId] = u.nickname + '（' + u.username + '）' })
  } finally {
    userLoading.value = false
  }
}

function handleUserTableChange(pag) {
  userPagination.current = pag.current
  loadUsers()
}

function confirmUserSelect() {
  selectedIds.value = [...tempUserIds.value]
  selectedUserNames.value = tempUserIds.value.map(id => userMap.value[id]).filter(Boolean)
  userPickerVisible.value = false
}

function removeSelectedUser(name) {
  const idx = selectedUserNames.value.indexOf(name)
  if (idx > -1) {
    selectedUserNames.value.splice(idx, 1)
    selectedIds.value.splice(idx, 1)
  }
}

async function loadSelectedUserNames(ids) {
  try {
    const promises = ids.map(id => listUser({ pageNum: 1, pageSize: 1, userId: id }).catch(() => null))
    const results = await Promise.all(promises)
    const names = []
    results.forEach((res, i) => {
      const u = res?.records?.[0]
      if (u) {
        const label = u.nickname + '（' + u.username + '）'
        userMap.value[u.userId] = label
        names.push(label)
      } else {
        names.push('用户' + ids[i])
      }
    })
    selectedUserNames.value = names
  } catch {
    selectedUserNames.value = ids.map(id => '用户' + id)
  }
}

function flattenDeptIds(nodes, result = []) {
  ;(nodes || []).forEach(item => {
    if (item.deptId !== undefined && item.deptId !== null) result.push(item.deptId)
    if (Array.isArray(item.children) && item.children.length) flattenDeptIds(item.children, result)
  })
  return result
}

function checkAllDepts() {
  selectedIds.value = flattenDeptIds(deptTree.value)
}

function onDeptCheck(checkedKeys) {
  selectedIds.value = checkedKeys
}

async function handleSubmit() {
  if (!form.title) {
    message.warning('请输入标题')
    return
  }
  submitLoading.value = true
  try {
    if (form.messageId) {
      await updateAnnounce({ ...form })
      message.success('更新成功')
    } else {
      await createAnnounce({ ...form })
      message.success('发布成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (e) {
    // handled by interceptor
  } finally {
    submitLoading.value = false
  }
}

function handleRevoke(record) {
  Modal.confirm({
    title: '确认撤回',
    content: `确定要撤回公告"${record.title}"吗？`,
    onOk: async () => {
      await revokeAnnounce(record.messageId)
      message.success('撤回成功')
      loadData()
    }
  })
}

function handleDelete(record) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除公告"${record.title}"吗？`,
    onOk: async () => {
      await deleteAnnounce(record.messageId)
      message.success('删除成功')
      loadData()
    }
  })
}
</script>

<style scoped>
.editor-wrapper {
  width: 100%;
}
.editor-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}
.scope-tree-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}
.scope-tree {
  max-height: 320px;
  overflow: auto;
  padding: 8px;
  border: 1px solid var(--app-border);
  border-radius: 6px;
}
</style>
