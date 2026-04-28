<template>
  <div class="page-shell">
    <a-card :bordered="false" class="page-panel">
      <div class="page-toolbar">
        <div class="page-title-block">
          <h2 class="page-title">操作日志</h2>
          <div class="page-subtitle">查询各服务的操作审计日志</div>
        </div>
        <a-button @click="loadData">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
      </div>

      <div class="operlog-filter">
        <label class="filter-item">
          <span>操作标题</span>
          <a-input v-model:value="query.title" class="filter-control" placeholder="请输入" allow-clear @press-enter="handleSearch" />
        </label>
        <label class="filter-item">
          <span>操作人员</span>
          <a-input v-model:value="query.operName" class="filter-control" placeholder="请输入" allow-clear @press-enter="handleSearch" />
        </label>
        <label class="filter-item status-filter">
          <span>状态</span>
          <a-select v-model:value="query.status" class="filter-control" placeholder="全部" allow-clear>
            <a-select-option :value="0">成功</a-select-option>
            <a-select-option :value="1">失败</a-select-option>
          </a-select>
        </label>
        <label class="filter-item time-filter">
          <span>操作时间</span>
          <a-range-picker v-model:value="dateRange" class="filter-control" show-time />
        </label>
        <div class="filter-actions">
          <a-button type="primary" @click="handleSearch">
            <template #icon><SearchOutlined /></template>
            查询
          </a-button>
          <a-button @click="handleReset">
            <template #icon><UndoOutlined /></template>
            重置
          </a-button>
        </div>
      </div>

      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="operId"
        size="middle"
        :scroll="{ x: 1050 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 0 ? 'green' : 'red'">
              {{ record.status === 0 ? '成功' : '失败' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <div class="table-actions">
              <a-button type="link" size="small" @click="handleDetail(record)">详情</a-button>
              <a-popconfirm title="确认删除？" @confirm="handleDelete(record.operId)">
                <a-button type="link" danger size="small">删除</a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="detailVisible"
      :footer="null"
      width="920px"
      centered
      wrap-class-name="operlog-detail-modal"
    >
      <template #title>
        <div class="detail-modal-title">
          <span class="detail-modal-icon"><FileTextOutlined /></span>
          <span>操作日志详情</span>
        </div>
      </template>

      <div v-if="detailData" class="operlog-detail">
        <div class="detail-hero">
          <div class="detail-hero-main">
            <div class="detail-kicker">操作标题</div>
            <div class="detail-title">{{ fallback(detailData.title) }}</div>
            <div class="detail-subline">
              <a-tag class="detail-status-tag" :color="isSuccess(detailData.status) ? 'success' : 'error'">
                <CheckCircleOutlined v-if="isSuccess(detailData.status)" />
                <CloseCircleOutlined v-else />
                {{ isSuccess(detailData.status) ? '成功' : '失败' }}
              </a-tag>
              <span class="detail-subitem">
                <ApiOutlined />
                {{ fallback(detailData.requestMethod) }}
              </span>
              <span class="detail-subitem">
                <ClockCircleOutlined />
                {{ fallback(detailData.operTime) }}
              </span>
            </div>
          </div>
          <div class="detail-cost">
            <span>{{ fallback(detailData.costTime) }}</span>
            <small>ms</small>
          </div>
        </div>

        <section class="detail-section">
          <div class="detail-section-title">
            <FileTextOutlined />
            <span>基础信息</span>
          </div>
          <div class="detail-grid">
            <div
              v-for="item in detailFields"
              :key="item.label"
              class="detail-item"
              :class="{ 'is-wide': item.wide }"
            >
              <div class="detail-label">{{ item.label }}</div>
              <div class="detail-value" :class="{ 'is-mono': item.mono }">{{ item.value }}</div>
            </div>
          </div>
        </section>

        <a-collapse v-model:activeKey="detailCollapseKeys" class="detail-collapse" ghost>
          <a-collapse-panel key="params">
            <template #header>
              <span class="detail-collapse-title">
                <CodeOutlined />
                <span>请求参数</span>
              </span>
            </template>
            <pre class="detail-code">{{ formatCode(detailData.operParam) }}</pre>
          </a-collapse-panel>
          <a-collapse-panel key="result">
            <template #header>
              <span class="detail-collapse-title">
                <ApiOutlined />
                <span>返回结果</span>
              </span>
            </template>
            <pre class="detail-code">{{ formatCode(detailData.jsonResult) }}</pre>
          </a-collapse-panel>
        </a-collapse>

        <section v-if="detailData.errorMsg" class="detail-section detail-error">
          <div class="detail-section-title">
            <CloseCircleOutlined />
            <span>错误消息</span>
          </div>
          <pre class="detail-code">{{ detailData.errorMsg }}</pre>
        </section>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  ApiOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CodeOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
  UndoOutlined
} from '@ant-design/icons-vue'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref([])
const dateRange = ref(null)
const detailVisible = ref(false)
const detailData = ref(null)
const detailCollapseKeys = ref([])

const query = reactive({
  title: '',
  operName: '',
  status: undefined,
  beginTime: '',
  endTime: '',
  pageNum: 1,
  pageSize: 10
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: total => `共 ${total} 条`
})

const columns = [
  { title: '操作标题', dataIndex: 'title', width: 140, ellipsis: true },
  { title: '业务类型', dataIndex: 'businessType', width: 100 },
  { title: '操作人员', dataIndex: 'operName', width: 100 },
  { title: '操作IP', dataIndex: 'operIp', width: 130 },
  { title: '状态', key: 'status', width: 80, align: 'center' },
  { title: '耗时', dataIndex: 'costTime', width: 80, customRender: ({ text }) => text ? `${text}ms` : '-' },
  { title: '操作时间', dataIndex: 'operTime', width: 170 },
  { title: '操作', key: 'action', width: 130, fixed: 'right' }
]

const businessTypeMap = {
  0: '其他',
  1: '新增',
  2: '修改',
  3: '删除',
  4: '授权',
  5: '导出',
  6: '导入',
  7: '强退',
  8: '清空'
}

const detailFields = computed(() => {
  const data = detailData.value || {}
  return [
    { label: '业务类型', value: formatBusinessType(data.businessType) },
    { label: '请求方式', value: fallback(data.requestMethod), mono: true },
    { label: '操作人员', value: fallback(data.operName) },
    { label: '操作 IP', value: fallback(data.operIp), mono: true },
    { label: '操作时间', value: fallback(data.operTime) },
    { label: '耗时', value: isBlank(data.costTime) ? '-' : `${data.costTime} ms` },
    { label: '方法名称', value: fallback(data.method), mono: true, wide: true }
  ]
})

function isBlank(value) {
  return value === undefined || value === null || value === ''
}

function fallback(value) {
  return isBlank(value) ? '-' : value
}

function isSuccess(status) {
  return Number(status) === 0
}

function formatBusinessType(value) {
  if (isBlank(value)) return '-'
  const numericValue = Number(value)
  return businessTypeMap[numericValue] || value
}

function formatCode(value) {
  if (isBlank(value)) return '-'
  if (typeof value !== 'string') {
    return JSON.stringify(value, null, 2)
  }

  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

async function loadData() {
  loading.value = true
  try {
    if (dateRange.value && dateRange.value.length === 2) {
      query.beginTime = dateRange.value[0].format('YYYY-MM-DDTHH:mm:ss')
      query.endTime = dateRange.value[1].format('YYYY-MM-DDTHH:mm:ss')
    } else {
      query.beginTime = ''
      query.endTime = ''
    }
    const res = await request.get('/monitor/operlog', { params: query })
    tableData.value = res.records || []
    pagination.total = res.total || 0
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.pageNum = 1
  pagination.current = 1
  loadData()
}

function handleReset() {
  query.title = ''
  query.operName = ''
  query.status = undefined
  query.beginTime = ''
  query.endTime = ''
  dateRange.value = null
  handleSearch()
}

function handleTableChange(pag) {
  query.pageNum = pag.current
  query.pageSize = pag.pageSize
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

async function handleDetail(record) {
  try {
    detailData.value = await request.get(`/monitor/operlog/${record.operId}`)
    detailCollapseKeys.value = []
    detailVisible.value = true
  } catch {}
}

async function handleDelete(operId) {
  await request.delete('/monitor/operlog', { data: [operId] })
  message.success('删除成功')
  loadData()
}

onMounted(loadData)
</script>

<style scoped>
.operlog-filter {
  display: grid;
  grid-template-columns:
    minmax(170px, 0.8fr)
    minmax(160px, 0.7fr)
    minmax(120px, 0.48fr)
    minmax(320px, 1.5fr)
    auto;
  gap: 12px;
  align-items: end;
  margin-bottom: 18px;
  padding: 14px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-bg-soft);
}

.filter-item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
  color: var(--app-text-secondary);
  font-size: 13px;
  font-weight: 600;
}

.filter-control {
  width: 100% !important;
}

.filter-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.filter-actions .ant-btn {
  min-width: 78px;
}

.detail-modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--app-text);
  font-size: 16px;
  font-weight: 600;
}

.detail-modal-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  color: #1f4fbf;
  background: var(--app-primary-soft);
}

.operlog-detail {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-hero {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 18px;
  padding: 18px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(31, 79, 191, 0.09), rgba(31, 79, 191, 0)),
    var(--app-bg-soft);
}

.detail-hero-main {
  min-width: 0;
}

.detail-kicker {
  margin-bottom: 4px;
  color: var(--app-text-muted);
  font-size: 12px;
}

.detail-title {
  color: var(--app-text);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.35;
  word-break: break-word;
}

.detail-subline {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.detail-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-inline-end: 0;
  font-weight: 600;
}

.detail-subitem {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--app-text-secondary);
  font-size: 13px;
}

.detail-cost {
  display: flex;
  flex: 0 0 118px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-left: 1px solid var(--app-border);
  color: #1f4fbf;
}

.detail-cost span {
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
}

.detail-cost small {
  margin-top: 4px;
  color: var(--app-text-muted);
  font-size: 12px;
}

.detail-section {
  padding: 14px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-panel);
}

.detail-section-title {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 12px;
  color: var(--app-text);
  font-size: 14px;
  font-weight: 600;
}

.detail-section-title .anticon {
  color: #1f4fbf;
}

.detail-collapse {
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-panel);
  overflow: hidden;
}

.detail-collapse :deep(.ant-collapse-item) {
  border-bottom-color: var(--app-border);
}

.detail-collapse :deep(.ant-collapse-item:last-child) {
  border-bottom: 0;
}

.detail-collapse :deep(.ant-collapse-header) {
  align-items: center;
  padding: 13px 14px !important;
  color: var(--app-text) !important;
  font-weight: 600;
}

.detail-collapse :deep(.ant-collapse-content-box) {
  padding: 0 14px 14px !important;
}

.detail-collapse-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.detail-collapse-title .anticon {
  color: #1f4fbf;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.detail-item {
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid var(--app-border);
  border-radius: 6px;
  background: var(--app-bg-soft);
}

.detail-item.is-wide {
  grid-column: 1 / -1;
}

.detail-label {
  margin-bottom: 5px;
  color: var(--app-text-muted);
  font-size: 12px;
}

.detail-value {
  color: var(--app-text);
  font-size: 14px;
  line-height: 1.55;
  word-break: break-word;
}

.detail-value.is-mono,
.detail-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.detail-code {
  max-height: 220px;
  margin: 0;
  padding: 12px;
  overflow: auto;
  border: 1px solid var(--app-border);
  border-radius: 6px;
  color: var(--app-text-secondary);
  background: var(--app-bg-soft);
  font-size: 12px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.detail-error {
  border-color: rgba(255, 77, 79, 0.35);
}

.detail-error .detail-section-title,
.detail-error .detail-section-title .anticon {
  color: #cf1322;
}

:global(.operlog-detail-modal .ant-modal-content) {
  border-radius: 10px;
  background: var(--app-panel);
}

:global(.operlog-detail-modal .ant-modal-header) {
  margin-bottom: 14px;
  background: transparent;
}

:global(.operlog-detail-modal .ant-modal-body) {
  padding-top: 2px;
}

:global(html.dark) .detail-modal-icon {
  color: #76a7ff;
  background: rgba(79, 140, 255, 0.14);
}

:global(html.dark) .detail-hero {
  background:
    linear-gradient(135deg, rgba(79, 140, 255, 0.14), rgba(79, 140, 255, 0)),
    #141820;
}

:global(html.dark) .operlog-filter {
  background: #141820;
}

:global(html.dark) .detail-cost,
:global(html.dark) .detail-section-title .anticon {
  color: #76a7ff;
}

:global(html.dark) .detail-item,
:global(html.dark) .detail-code,
:global(html.dark) .detail-collapse {
  background: #12151b;
}

:global(html.dark) .detail-collapse-title .anticon {
  color: #76a7ff;
}

@media (max-width: 760px) {
  .operlog-filter {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1180px) and (min-width: 761px) {
  .operlog-filter {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 760px) {
  .detail-hero {
    flex-direction: column;
  }

  .detail-cost {
    flex: none;
    align-items: flex-start;
    border-top: 1px solid var(--app-border);
    border-left: 0;
    padding-top: 14px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
