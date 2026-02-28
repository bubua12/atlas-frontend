<template>
  <div>
    <el-row :gutter="16">
      <el-col :span="10">
        <el-card shadow="never" header="字典类型">
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span>字典类型</span>
              <el-button type="success" size="small" @click="openTypeDialog()">新增</el-button>
            </div>
          </template>
          <el-table :data="typeList" border stripe highlight-current-row @current-change="handleTypeSelect" v-loading="typeLoading">
            <el-table-column prop="dictName" label="字典名称" />
            <el-table-column prop="dictType" label="字典类型" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 0 ? 'success' : 'danger'">{{ row.status === 0 ? '正常' : '停用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button link type="primary" @click="openTypeDialog(row)">编辑</el-button>
                <el-popconfirm title="确认删除？" @confirm="handleDeleteType(row.dictId)">
                  <template #reference>
                    <el-button link type="danger">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="14">
        <el-card shadow="never">
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span>字典数据 {{ currentType ? '- ' + currentType.dictName : '' }}</span>
              <el-button type="success" size="small" :disabled="!currentType" @click="openDataDialog()">新增</el-button>
            </div>
          </template>
          <el-table :data="dataList" border stripe v-loading="dataLoading">
            <el-table-column prop="dictLabel" label="字典标签" />
            <el-table-column prop="dictValue" label="字典值" />
            <el-table-column prop="dictSort" label="排序" width="80" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 0 ? 'success' : 'danger'">{{ row.status === 0 ? '正常' : '停用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button link type="primary" @click="openDataDialog(row)">编辑</el-button>
                <el-popconfirm title="确认删除？" @confirm="handleDeleteData(row.dictCode)">
                  <template #reference>
                    <el-button link type="danger">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 字典类型弹窗 -->
    <el-dialog v-model="typeDialogVisible" :title="typeForm.dictId ? '编辑字典类型' : '新增字典类型'" width="500px">
      <el-form :model="typeForm" :rules="typeRules" ref="typeFormRef" label-width="80px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="typeForm.dictName" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="typeForm.dictType" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="typeForm.status">
            <el-radio :value="0">正常</el-radio>
            <el-radio :value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTypeSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 字典数据弹窗 -->
    <el-dialog v-model="dataDialogVisible" :title="dataForm.dictCode ? '编辑字典数据' : '新增字典数据'" width="500px">
      <el-form :model="dataForm" :rules="dataRules" ref="dataFormRef" label-width="80px">
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input v-model="dataForm.dictLabel" />
        </el-form-item>
        <el-form-item label="字典值" prop="dictValue">
          <el-input v-model="dataForm.dictValue" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dataForm.dictSort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="dataForm.status">
            <el-radio :value="0">正常</el-radio>
            <el-radio :value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleDataSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listDictType, addDictType, updateDictType, deleteDictType, getDictData, addDictData, updateDictData, deleteDictData } from '@/api/dict'

const typeLoading = ref(false)
const dataLoading = ref(false)
const typeList = ref([])
const dataList = ref([])
const currentType = ref(null)

// 类型表单
const typeDialogVisible = ref(false)
const typeFormRef = ref()
const typeForm = reactive({ dictId: null, dictName: '', dictType: '', status: 0 })
const typeRules = {
  dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  dictType: [{ required: true, message: '请输入字典类型', trigger: 'blur' }]
}

// 数据表单
const dataDialogVisible = ref(false)
const dataFormRef = ref()
const dataForm = reactive({ dictCode: null, dictType: '', dictLabel: '', dictValue: '', dictSort: 0, status: 0 })
const dataRules = {
  dictLabel: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  dictValue: [{ required: true, message: '请输入字典值', trigger: 'blur' }]
}

async function loadTypes() {
  typeLoading.value = true
  try {
    const res = await listDictType()
    typeList.value = Array.isArray(res) ? res : res.records || []
  } finally {
    typeLoading.value = false
  }
}

async function handleTypeSelect(row) {
  if (!row) return
  currentType.value = row
  dataLoading.value = true
  try {
    const res = await getDictData(row.dictType)
    dataList.value = Array.isArray(res) ? res : []
  } finally {
    dataLoading.value = false
  }
}

function openTypeDialog(row) {
  Object.keys(typeForm).forEach(k => delete typeForm[k])
  Object.assign(typeForm, row || { dictId: null, dictName: '', dictType: '', status: 0 })
  typeDialogVisible.value = true
}

async function handleTypeSubmit() {
  await typeFormRef.value.validate()
  const data = { ...typeForm }
  if (!data.dictId) delete data.dictId
  try {
    data.dictId ? await updateDictType(data) : await addDictType(data)
    ElMessage.success('操作成功')
    typeDialogVisible.value = false
    loadTypes()
  } catch (e) { /* interceptor already shows error */ }
}

async function handleDeleteType(id) {
  await deleteDictType(id)
  ElMessage.success('删除成功')
  currentType.value = null
  dataList.value = []
  loadTypes()
}

function openDataDialog(row) {
  Object.keys(dataForm).forEach(k => delete dataForm[k])
  Object.assign(dataForm, row || { dictCode: null, dictType: currentType.value.dictType, dictLabel: '', dictValue: '', dictSort: 0, status: 0 })
  dataDialogVisible.value = true
}

async function handleDataSubmit() {
  await dataFormRef.value.validate()
  const data = { ...dataForm }
  if (!data.dictCode) delete data.dictCode
  try {
    data.dictCode ? await updateDictData(data) : await addDictData(data)
    ElMessage.success('操作成功')
    dataDialogVisible.value = false
    handleTypeSelect(currentType.value)
  } catch (e) { /* interceptor already shows error */ }
}

async function handleDeleteData(code) {
  await deleteDictData(code)
  ElMessage.success('删除成功')
  handleTypeSelect(currentType.value)
}

onMounted(loadTypes)
</script>
