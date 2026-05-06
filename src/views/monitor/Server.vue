<template>
  <div class="page-shell server-page">
    <!-- ==================== 顶部统计条 ==================== -->
    <div class="server-hero">
      <div>
        <div class="hero-kicker">Service Monitor</div>
        <h2>服务监控</h2>
        <p>实时查看所有微服务的 CPU、内存、JVM 运行指标</p>
      </div>
      <div class="hero-actions">
        <a-radio-group v-model:value="viewMode" button-style="solid" size="small">
          <a-radio-button value="overview">服务总览</a-radio-button>
          <a-radio-button value="detail">单服务详情</a-radio-button>
        </a-radio-group>
        <a-button style="margin-left: 12px" @click="handleRefresh">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
      </div>
    </div>

    <!-- ==================== 服务总览 ==================== -->
    <template v-if="viewMode === 'overview'">
      <!-- 汇总统计卡片 -->
      <div class="summary-stats">
        <a-card :bordered="false" class="page-panel stat-card">
          <div class="stat-card-body">
            <div class="stat-icon" style="color: #52c41a; background: rgba(82, 196, 26, 0.12)">
              <CheckCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-title">健康服务</div>
              <div class="stat-value" style="color: #52c41a">{{ healthyCount }}/{{ summaryList.length }}</div>
              <div class="stat-desc">正常运行的服务数量</div>
            </div>
          </div>
        </a-card>
        <a-card :bordered="false" class="page-panel stat-card">
          <div class="stat-card-body">
            <div class="stat-icon" style="color: #4f6bed; background: rgba(79, 107, 237, 0.12)">
              <DashboardOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-title">平均 CPU</div>
              <div class="stat-value" style="color: #4f6bed">{{ avgCpu }}%</div>
              <div class="stat-desc">所有服务 CPU 使用率均值</div>
            </div>
          </div>
        </a-card>
        <a-card :bordered="false" class="page-panel stat-card">
          <div class="stat-card-body">
            <div class="stat-icon" style="color: #f6b74b; background: rgba(246, 183, 75, 0.12)">
              <DatabaseOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-title">平均内存</div>
              <div class="stat-value" style="color: #f6b74b">{{ avgMemory }}%</div>
              <div class="stat-desc">所有服务系统内存使用率均值</div>
            </div>
          </div>
        </a-card>
        <a-card :bordered="false" class="page-panel stat-card">
          <div class="stat-card-body">
            <div class="stat-icon" style="color: #722ed1; background: rgba(114, 46, 209, 0.12)">
              <CloudServerOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-title">总实例数</div>
              <div class="stat-value" style="color: #722ed1">{{ totalInstances }}</div>
              <div class="stat-desc">所有服务的实例总数</div>
            </div>
          </div>
        </a-card>
      </div>

      <!-- 服务卡片网格 -->
      <a-spin :spinning="summaryLoading">
        <a-empty v-if="!summaryLoading && !summaryList.length" description="暂无已注册的服务" />
        <div v-else class="service-grid">
          <a-card
            v-for="svc in summaryList"
            :key="svc.serviceName"
            :bordered="false"
            class="page-panel service-card"
            :class="{ 'service-card--down': svc.status !== 'UP' }"
            hoverable
            @click="handleServiceClick(svc.serviceName)"
          >
            <div class="svc-header">
              <div class="svc-name-row">
                <span class="svc-dot" :class="svc.status === 'UP' ? 'svc-dot--up' : 'svc-dot--down'"></span>
                <span class="svc-name">{{ svc.serviceName }}</span>
              </div>
              <a-tag :color="svc.status === 'UP' ? 'green' : (svc.status === 'DOWN' || svc.status === 'OFFLINE') ? 'red' : 'orange'" class="svc-tag">
                {{ svc.status || 'UNKNOWN' }}
              </a-tag>
            </div>

            <div class="svc-metrics">
              <div class="svc-metric">
                <div class="svc-metric-label">CPU</div>
                <a-progress
                  :percent="normalizePercent(svc.cpuUsage)"
                  :stroke-color="usageStrokeColor(svc.cpuUsage)"
                  :show-info="true"
                  :format="formatPercent"
                  size="small"
                />
              </div>
              <div class="svc-metric">
                <div class="svc-metric-label">内存</div>
                <a-progress
                  :percent="normalizePercent(svc.memoryUsage)"
                  :stroke-color="usageStrokeColor(svc.memoryUsage)"
                  :show-info="true"
                  :format="formatPercent"
                  size="small"
                />
              </div>
              <div class="svc-metric">
                <div class="svc-metric-label">JVM</div>
                <a-progress
                  :percent="normalizePercent(svc.jvmUsage)"
                  :stroke-color="usageStrokeColor(svc.jvmUsage)"
                  :show-info="true"
                  :format="formatPercent"
                  size="small"
                />
              </div>
            </div>

            <div class="svc-footer">
              <span class="svc-meta">
                <HddOutlined />
                {{ svc.instanceCount }} 实例
              </span>
              <span class="svc-meta">
                <ClockCircleOutlined />
                {{ svc.uptime || '-' }}
              </span>
            </div>
          </a-card>
        </div>
      </a-spin>
    </template>

    <!-- ==================== 单服务详情 ==================== -->
    <template v-if="viewMode === 'detail'">
      <div class="detail-toolbar">
        <span class="detail-label">选择服务：</span>
        <a-select
          v-model:value="selectedService"
          placeholder="请选择服务"
          style="width: 280px"
          @change="handleServiceChange"
        >
          <a-select-option v-for="s in summaryList" :key="s.serviceName" :value="s.serviceName">
            <span class="svc-dot" :class="s.status === 'UP' ? 'svc-dot--up' : 'svc-dot--down'" style="display:inline-block;margin-right:8px"></span>
            {{ s.serviceName }}
          </a-select-option>
        </a-select>
      </div>

      <a-spin :spinning="detailLoading">
        <template v-if="detail && detail.instances && detail.instances.length > 0">
          <!-- 多实例 Tab 切换 -->
          <a-tabs
            v-if="detail.instances.length > 1"
            v-model:activeKey="activeInstanceKey"
            type="card"
            style="margin-bottom: 16px"
          >
            <a-tab-pane
              v-for="(inst, idx) in detail.instances"
              :key="String(idx)"
            >
              <template #tab>
                <span>
                  <span class="svc-dot" :class="inst.status === 'UP' ? 'svc-dot--up' : 'svc-dot--down'" style="margin-right:6px"></span>
                  {{ inst.hostName || inst.serviceUrl || inst.instanceId }}
                </span>
              </template>
              <instance-cards :instance="inst" />
            </a-tab-pane>
          </a-tabs>

          <!-- 单实例直接展示 -->
          <instance-cards v-else :instance="detail.instances[0]" />
        </template>
        <a-empty v-else-if="selectedService && !detailLoading" description="该服务暂无可用实例" />
        <a-empty v-else-if="!selectedService" description="请在上方选择一个服务" />
      </a-spin>
    </template>
  </div>
</template>

<script>
import { defineComponent, h } from 'vue'
import { Card, Row, Col, Descriptions, Progress, Badge, Typography } from 'ant-design-vue'
import { InfoCircleOutlined, DashboardOutlined, CloudServerOutlined, DatabaseOutlined } from '@ant-design/icons-vue'

function normalizePercent(value) {
  const percent = typeof value === 'string'
    ? Number.parseFloat(value.replace('%', ''))
    : Number(value)
  if (!Number.isFinite(percent)) return 0
  return Math.min(100, Math.max(0, Number(percent.toFixed(2))))
}

function formatPercent(p) {
  return `${normalizePercent(p).toFixed(1)}%`
}

function usageStrokeColor(value) {
  const p = normalizePercent(value)
  if (p >= 80) return '#ff4d4f'
  if (p >= 60) return '#faad14'
  return '#52c41a'
}

/** 单实例详情卡片（render function） */
const InstanceCards = defineComponent({
  name: 'InstanceCards',
  props: { instance: { type: Object, required: true } },
  setup(props) {
    return () => {
      const inst = props.instance
      const dp = { column: 1, size: 'small', labelStyle: { width: '130px' } }
      const di = (label, val) => h(Descriptions.Item, { label }, () => val)
      const prog = (v) => h(Progress, {
        percent: normalizePercent(v), size: 'small',
        strokeColor: usageStrokeColor(v), format: p => formatPercent(p)
      })

      return h('div', { class: 'detail-grid' }, [
        // 基础信息
        h('div', { class: 'detail-card' }, [
          h('div', { class: 'detail-card-header' }, [
            h('span', { class: 'detail-card-icon', style: 'color:#4f6bed;margin-right:6px' }, h(InfoCircleOutlined)),
            h('span', null, '基础信息')
          ]),
          h(Descriptions, { ...dp, class: 'detail-card-body' }, () => [
            di('主机名', inst.hostName || '-'),
            di('服务地址', inst.serviceUrl || '-'),
            di('实例状态', h(Badge, { status: inst.status === 'UP' ? 'success' : 'error', text: inst.status })),
            di('CPU 核心数', inst.cpu?.processors ?? '-'),
          ])
        ]),
        // CPU
        h('div', { class: 'detail-card' }, [
          h('div', { class: 'detail-card-header' }, [
            h('span', { class: 'detail-card-icon', style: 'color:#52c41a;margin-right:6px' }, h(DashboardOutlined)),
            h('span', null, 'CPU 信息')
          ]),
          h(Descriptions, { ...dp, class: 'detail-card-body' }, () => [
            di('核心数', inst.cpu?.processors ?? '-'),
            di('使用率', prog(inst.cpu?.usageRate)),
          ])
        ]),
        // JVM
        h('div', { class: 'detail-card' }, [
          h('div', { class: 'detail-card-header' }, [
            h('span', { class: 'detail-card-icon', style: 'color:#722ed1;margin-right:6px' }, h(CloudServerOutlined)),
            h('span', null, 'JVM 信息')
          ]),
          h(Descriptions, { ...dp, class: 'detail-card-body' }, () => [
            di('最大内存', `${inst.jvm?.maxMemory ?? '-'} MB`),
            di('已申请内存', `${inst.jvm?.totalMemory ?? '-'} MB`),
            di('已使用内存', `${inst.jvm?.usedMemory ?? '-'} MB`),
            di('空闲内存', `${inst.jvm?.freeMemory ?? '-'} MB`),
            di('使用率', prog(inst.jvm?.usageRate)),
            di('运行时长', inst.jvm?.runTime || '-'),
          ])
        ]),
        // 物理内存
        h('div', { class: 'detail-card' }, [
          h('div', { class: 'detail-card-header' }, [
            h('span', { class: 'detail-card-icon', style: 'color:#f6b74b;margin-right:6px' }, h(DatabaseOutlined)),
            h('span', null, '物理内存')
          ]),
          h(Descriptions, { ...dp, class: 'detail-card-body' }, () => [
            di('总内存', `${inst.sys?.totalMemory ?? '-'} MB`),
            di('已使用', `${inst.sys?.usedMemory ?? '-'} MB`),
            di('剩余', `${inst.sys?.freeMemory ?? '-'} MB`),
            di('使用率', prog(inst.sys?.usageRate)),
          ])
        ]),
      ])
    }
  }
})

export default {
  components: { InstanceCards }
}
</script>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  ReloadOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  HddOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'
import request from '@/utils/request'

// ==================== 工具函数 ====================

function normalizePercent(value) {
  const percent = typeof value === 'string'
    ? Number.parseFloat(value.replace('%', ''))
    : Number(value)
  if (!Number.isFinite(percent)) return 0
  return Math.min(100, Math.max(0, Number(percent.toFixed(2))))
}

function formatPercent(p) {
  return `${normalizePercent(p).toFixed(1)}%`
}

function usageStrokeColor(value) {
  const p = normalizePercent(value)
  if (p >= 80) return '#ff4d4f'
  if (p >= 60) return '#faad14'
  return '#52c41a'
}

// ==================== 状态 ====================

const viewMode = ref('overview')
const summaryLoading = ref(false)
const detailLoading = ref(false)
const summaryList = ref([])
const selectedService = ref(null)
const detail = ref(null)
const activeInstanceKey = ref('0')

const healthyCount = computed(() => summaryList.value.filter(s => s.status === 'UP').length)
const totalInstances = computed(() => summaryList.value.reduce((sum, s) => sum + (s.instanceCount || 0), 0))
const avgCpu = computed(() => {
  const vals = summaryList.value.filter(s => s.cpuUsage != null).map(s => s.cpuUsage)
  return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '--'
})
const avgMemory = computed(() => {
  const vals = summaryList.value.filter(s => s.memoryUsage != null).map(s => s.memoryUsage)
  return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '--'
})

// ==================== 数据加载 ====================

async function loadSummary() {
  summaryLoading.value = true
  try {
    summaryList.value = await request.get('/monitor/server/services')
  } catch {
    summaryList.value = []
  } finally {
    summaryLoading.value = false
  }
}

async function loadDetail(serviceName) {
  if (!serviceName) return
  detailLoading.value = true
  detail.value = null
  activeInstanceKey.value = '0'
  try {
    detail.value = await request.get(`/monitor/server/services/${serviceName}`)
  } catch {
    detail.value = null
  } finally {
    detailLoading.value = false
  }
}

function handleRefresh() {
  if (viewMode.value === 'overview') {
    loadSummary()
  } else if (selectedService.value) {
    loadSummary()
    loadDetail(selectedService.value)
  }
}

function handleServiceClick(serviceName) {
  selectedService.value = serviceName
  viewMode.value = 'detail'
  loadDetail(serviceName)
}

function handleServiceChange(serviceName) {
  loadDetail(serviceName)
}

onMounted(loadSummary)
</script>

<style scoped>
/* ==================== Hero ==================== */
.server-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  margin-bottom: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4f6bed 0%, #7c3aed 100%);
  color: #fff;
}
.server-hero .hero-kicker {
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: .7;
  margin-bottom: 4px;
}
.server-hero h2 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 600;
  color: #fff;
}
.server-hero p {
  margin: 0;
  font-size: 13px;
  opacity: .85;
}
.hero-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* ==================== 统计卡片 ==================== */
.summary-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.stat-card {
  border-radius: 10px;
  transition: box-shadow .2s;
}
.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,.08);
}
.stat-card-body {
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.stat-content {
  flex: 1;
  min-width: 0;
}
.stat-title {
  font-size: 12px;
  color: var(--app-text-muted, #999);
  margin-bottom: 2px;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}
.stat-desc {
  font-size: 11px;
  color: var(--app-text-muted, #bbb);
  margin-top: 2px;
}

/* ==================== 服务卡片网格 ==================== */
.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}
.service-card {
  border-radius: 10px;
  cursor: pointer;
  transition: box-shadow .2s, transform .15s;
}
.service-card:hover {
  box-shadow: 0 4px 20px rgba(79, 107, 237, .12);
  transform: translateY(-2px);
}
.service-card--down {
  border-left: 3px solid #ff4d4f;
}
.svc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.svc-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.svc-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.svc-dot--up {
  background: #52c41a;
  box-shadow: 0 0 6px rgba(82, 196, 26, .45);
}
.svc-dot--down {
  background: #ff4d4f;
  box-shadow: 0 0 6px rgba(255, 77, 79, .45);
}
.svc-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--app-text, #1f1f1f);
}
.svc-tag {
  font-size: 11px;
  line-height: 18px;
}
.svc-metrics {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}
.svc-metric {
  display: flex;
  align-items: center;
  gap: 10px;
}
.svc-metric-label {
  width: 32px;
  font-size: 12px;
  color: var(--app-text-muted, #999);
  flex-shrink: 0;
  text-align: right;
}
.svc-metric .ant-progress {
  flex: 1;
}
.svc-footer {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid var(--app-border, #f0f0f0);
  padding-top: 12px;
  margin-top: 4px;
}
.svc-meta {
  font-size: 12px;
  color: var(--app-text-muted, #999);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ==================== 单服务详情 ==================== */
.detail-toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 14px 20px;
  background: var(--app-panel, #fff);
  border-radius: 10px;
}
.detail-label {
  font-weight: 500;
  margin-right: 12px;
  white-space: nowrap;
  color: var(--app-text, #1f1f1f);
}

/* 实例详情 4 卡片网格 */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.detail-card {
  background: var(--app-panel, #fff);
  border-radius: 10px;
  overflow: hidden;
}
.detail-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid var(--app-border, #f0f0f0);
  color: var(--app-text, #1f1f1f);
}
.detail-card-icon {
  display: inline-flex;
  align-items: center;
  font-size: 16px;
}
.detail-card-body {
  padding: 12px 20px 16px;
}

/* ==================== 响应式 ==================== */
@media (max-width: 1180px) {
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 760px) {
  .server-hero {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .summary-stats {
    grid-template-columns: 1fr;
  }
  .service-grid {
    grid-template-columns: 1fr;
  }
}

/* ==================== 暗色模式 ==================== */
:global(html.dark) .server-hero {
  background: linear-gradient(135deg, #3b5bdb 0%, #6741d9 100%);
}
:global(html.dark) .detail-card {
  background: var(--app-panel);
}
</style>
