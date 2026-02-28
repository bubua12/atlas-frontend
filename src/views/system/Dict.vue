<template>
  <div>
    <a-row :gutter="16">
      <a-col :span="10">
        <a-card :bordered="false" title="字典类型">
          <template #extra>
            <a-button type="primary" ghost size="small" @click="openTypeDialog()">新增</a-button>
          </template>
          <a-table :columns="typeCols" :data-source="typeList" :loading="typeLoading"
            row-key="dictId" :pagination="false" :row-class-name="(r) => r.dictId === currentType?.dictId ? 'ant-table-row-selected' : ''"
            :custom-row="(r) => ({ onClick: () => handleTypeSelect(r) })">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.status === 0 ? 'green' : 'red'">{{ record.status === 0 ? '正常' : '停用' }}</a-tag>
              </template>
              <template v-if="column.key === 'action'">
                <a-button type="link" size="small" @click.stop="openTypeDialog(record)">编辑</a-button>
                <a-popconfirm title="确认删除？" @confirm="handleDeleteType(record.dictId)">
                  <a-button type="link" danger size="small" @click.stop>删除</a-button>
                </a-popconfirm>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>

      <a-col :span="14">
        <a-card :bordered="false">
          <template #title>字典数据 {{ currentType ? '- ' + currentType.dictName : '' }}</template>
          <template #extra>
            <a-button type="primary" ghost size="small" :disabled="!currentType" @click="openDataDialog()">新增</a-button>
          </template>
          <a-table :columns="dataCols" :data-source="dataList" :loading="dataLoading"
            row-key="dictCode" :pagination="false">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.status === 0 ? 'green' : 'red'">{{ record.status === 0 ? '正常' : '停用' }}</a-tag>
              </template>
              <template v-if="column.key === 'action'">
                <a-button type="link" size="small" @click="openDataDialog(record)">编辑</a-button>
                <a-popconfirm title="确认删除？" @confirm="handleDeleteData(record.dictCode)">
                  <a-button type="link" danger size="small">删除</a-button>
                </a-popconfirm>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <a-modal v-model:open="typeDialogVisible" :title="typeForm.dictId ? '编辑字典类型' : '新增字典类型'" @ok="handleTypeSubmit">
      <a-form :model="typeForm" :rules="typeRules" ref="typeFormRef" :label-col="{ span: 5 }">
        <a-form-item label="字典名称" name="dictName">
          <a-input v-model:value="typeForm.dictName" />
        </a-form-item>
        <a-form-item label="字典类型" name="dictType">
          <a-input v-model:value="typeForm.dictType" />
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model:value="typeForm.status">
            <a-radio :value="0">正常</a-radio>
            <a-radio :value="1">停用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="dataDialogVisible" :title="dataForm.dictCode ? '编辑字典数据' : '新增字典数据'" @ok="handleDataSubmit">
      <a-form :model="dataForm" :rules="dataRules" ref="dataFormRef" :label-col="{ span: 5 }">
        <a-form-item label="字典标签" name="dictLabel">
          <a-input v-model:value="dataForm.dictLabel" />
        </a-form-item>
        <a-form-item label="字典值" name="dictValue">
          <a-input v-model:value="dataForm.dictValue" />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="dataForm.dictSort" :min="0" />
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model:value="dataForm.status">
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
import { listDictType, addDictType, updateDictType, deleteDictType, getDictData, addDictData, updateDictData, deleteDictData } from '@/api/dict'

const typeLoading = ref(false)
const dataLoading = ref(false)
const typeList = ref([])
const dataList = ref([])
const currentType = ref(null)

const typeDialogVisible = ref(false)
const typeFormRef = ref()
const typeForm = reactive({ dictId: null, dictName: '', dictType: '', status: 0 })
const typeRules = {
  dictName: [{ required: true, message: '请输入字典名称' }],
  dictType: [{ required: true, message: '请输入字典类型' }]
}

const dataDialogVisible = ref(false)
const dataFormRef = ref()
const dataForm = reactive({ dictCode: null, dictType: '', dictLabel: '', dictValue: '', dictSort: 0, status: 0 })
const dataRules = {
  dictLabel: [{ required: true, message: '请输入字典标签' }],
  dictValue: [{ required: true, message: '请输入字典值' }]
}

const typeCols = [
  { title: '字典名称', dataIndex: 'dictName' },
  { title: '字典类型', dataIndex: 'dictType' },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 120 }
]
const dataCols = [
  { title: '字典标签', dataIndex: 'dictLabel' },
  { title: '字典值', dataIndex: 'dictValue' },
  { title: '排序', dataIndex: 'dictSort', width: 80 },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 120 }
]

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
    message.success('操作成功')
    typeDialogVisible.value = false
    loadTypes()
  } catch (e) { /* interceptor already shows error */ }
}

async function handleDeleteType(id) {
  await deleteDictType(id)
  message.success('删除成功')
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
    message.success('操作成功')
    dataDialogVisible.value = false
    handleTypeSelect(currentType.value)
  } catch (e) { /* interceptor already shows error */ }
}

async function handleDeleteData(code) {
  await deleteDictData(code)
  message.success('删除成功')
  handleTypeSelect(currentType.value)
}

onMounted(loadTypes)
</script>
