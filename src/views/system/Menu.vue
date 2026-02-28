<template>
  <div>
    <el-card shadow="never">
      <el-form :inline="true">
        <el-form-item>
          <el-button type="success" @click="openDialog()">新增</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border row-key="menuId" default-expand-all v-loading="loading">
        <el-table-column prop="menuName" label="菜单名称" />
        <el-table-column prop="icon" label="图标" width="80" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="path" label="路由地址" />
        <el-table-column prop="menuType" label="类型" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.menuType === 'M'">目录</el-tag>
            <el-tag v-else-if="row.menuType === 'C'" type="success">菜单</el-tag>
            <el-tag v-else type="info">按钮</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'">{{ row.status === 0 ? '正常' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button link type="primary" @click="openDialog({ parentId: row.menuId })">新增</el-button>
            <el-popconfirm title="确认删除？" @confirm="handleDelete(row.menuId)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.menuId ? '编辑菜单' : '新增菜单'" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="form.menuName" />
        </el-form-item>
        <el-form-item label="上级菜单">
          <el-input v-model="form.parentId" placeholder="0为顶级" />
        </el-form-item>
        <el-form-item label="菜单类型">
          <el-radio-group v-model="form.menuType">
            <el-radio value="M">目录</el-radio>
            <el-radio value="C">菜单</el-radio>
            <el-radio value="F">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="路由地址">
          <el-input v-model="form.path" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="0">正常</el-radio>
            <el-radio :value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listMenu, addMenu, updateMenu, deleteMenu } from '@/api/menu'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const formRef = ref()
const defaultForm = { menuId: null, menuName: '', parentId: 0, menuType: 'M', path: '', sort: 0, status: 0 }
const form = reactive({ ...defaultForm })
const rules = { menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }] }

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
    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadData()
  } catch (e) { /* interceptor already shows error */ }
}

async function handleDelete(id) {
  await deleteMenu(id)
  ElMessage.success('删除成功')
  loadData()
}

onMounted(loadData)
</script>
