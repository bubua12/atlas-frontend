<template>
  <div class="page-shell dashboard-page">
    <div class="dashboard-hero">
      <div>
        <div class="hero-kicker">Atlas Enterprise Platform</div>
        <h2>{{ greeting }}，{{ userStore.username || '管理员' }}</h2>
        <p>这里汇总在线会话、今日审计、服务状态和常用工作入口。</p>
      </div>
      <a-button @click="loadDashboard">
        <template #icon><ReloadOutlined /></template>
        刷新
      </a-button>
    </div>

    <div class="dashboard-grid">
      <a-card v-for="item in cards" :key="item.title" class="page-panel stat-card" :bordered="false">
        <a-spin :spinning="loading">
          <div class="stat-card-body">
            <div class="stat-icon" :style="{ color: item.color, background: item.background }">
              <component :is="item.icon" />
            </div>
            <div class="stat-content">
              <div class="stat-title">{{ item.title }}</div>
              <div class="stat-value" :style="{ color: item.color }">{{ item.value }}</div>
              <div class="stat-desc">{{ item.desc }}</div>
            </div>
          </div>
        </a-spin>
      </a-card>
    </div>

    <div class="dashboard-main">
      <a-card class="page-panel recent-panel" :bordered="false">
        <div class="panel-heading">
          <div>
            <h3 class="panel-heading-title">最近操作日志</h3>
            <div class="panel-heading-desc">最近 5 条系统审计记录</div>
          </div>
          <a-button type="link" @click="go('/monitor/operlog')">
            查看全部
            <template #icon><ArrowRightOutlined /></template>
          </a-button>
        </div>

        <a-empty v-if="!recentLogs.length && !loading" description="暂无操作日志" />
        <div v-else class="log-list">
          <div
            v-for="item in recentLogs"
            :key="item.operId || item.operTime"
            class="log-item"
            :class="{ failed: Number(item.status) !== 0 }"
          >
            <span class="log-dot"></span>
            <div class="log-content">
              <div class="log-topline">
                <div class="log-title">{{ item.title || '-' }}</div>
                <a-tag class="status-tag" :color="Number(item.status) === 0 ? 'green' : 'red'">
                  {{ Number(item.status) === 0 ? '成功' : '失败' }}
                </a-tag>
              </div>
              <div class="log-meta-grid">
                <span class="log-meta-item">
                  <UserOutlined />
                  {{ item.operName || '-' }}
                </span>
                <span class="log-meta-item">
                  <FileTextOutlined />
                  {{ formatBusinessType(item.businessType) }}
                </span>
                <span class="log-meta-item">
                  <ClockCircleOutlined />
                  {{ item.costTime ? `${item.costTime}ms` : '-' }}
                </span>
                <span class="log-meta-item is-wide">
                  <CloudServerOutlined />
                  {{ item.operIp || '-' }}
                </span>
              </div>
            </div>
            <div class="log-time">{{ formatDisplayTime(item.operTime) }}</div>
          </div>
        </div>
      </a-card>

      <div class="side-stack">
        <a-card class="page-panel" :bordered="false">
          <div class="panel-heading">
            <div>
              <h3 class="panel-heading-title">服务运行状态</h3>
              <div class="panel-heading-desc">微服务实例健康概览</div>
            </div>
            <a-button type="link" @click="go('/monitor/service')">
              详情
              <template #icon><ArrowRightOutlined /></template>
            </a-button>
          </div>

          <a-empty v-if="!services.length && !loading" description="暂无服务数据" />
          <div v-else class="service-list">
            <div
              v-for="item in services"
              :key="item.serviceName"
              class="service-item"
              :class="{ unhealthy: item.status === 'DOWN' || item.status === 'OFFLINE' }"
            >
              <span class="service-dot"></span>
              <div class="service-main">
                <div class="service-topline">
                  <div class="service-name">{{ item.serviceName }}</div>
                  <a-tag class="service-status" :color="serviceStatusColor(item.status)">
                    {{ item.status || 'UNKNOWN' }}
                  </a-tag>
                </div>
                <div class="service-meta-grid">
                  <span>{{ item.instanceCount || 0 }} 个实例</span>
                  <span>{{ firstServiceTarget(item) }}</span>
                </div>
              </div>
            </div>
          </div>
        </a-card>

        <a-card class="page-panel" :bordered="false">
          <div class="panel-heading">
            <div>
              <h3 class="panel-heading-title">常用入口</h3>
              <div class="panel-heading-desc">快速进入高频管理页面</div>
            </div>
          </div>

          <div class="quick-grid">
            <button v-for="item in quickLinks" :key="item.path" class="quick-link" type="button" @click="go(item.path)">
              <span class="quick-icon"><component :is="item.icon" /></span>
              <span>{{ item.title }}</span>
            </button>
          </div>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  CloudServerOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import request from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const onlineUsers = ref([])
const services = ref([])
const recentLogs = ref([])
const todayTotal = ref(null)
const todayError = ref(null)

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

const healthyServiceCount = computed(() => services.value.filter(item => item.status === 'UP').length)
const serviceCountText = computed(() => services.value.length ? `${healthyServiceCount.value}/${services.value.length}` : '--')
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const cards = computed(() => [
  {
    title: '在线用户',
    value: onlineUsers.value.length,
    desc: '当前有效在线会话',
    color: '#1f4fbf',
    background: 'rgba(31, 79, 191, 0.14)',
    icon: UserOutlined
  },
  {
    title: '今日操作',
    value: todayTotal.value ?? '--',
    desc: '今日产生的审计记录',
    color: '#63d685',
    background: 'rgba(99, 214, 133, 0.14)',
    icon: FileTextOutlined
  },
  {
    title: '今日异常',
    value: todayError.value ?? '--',
    desc: '今日失败或异常操作',
    color: '#ff7875',
    background: 'rgba(255, 120, 117, 0.14)',
    icon: todayError.value > 0 ? CloseCircleOutlined : CheckCircleOutlined
  },
  {
    title: '服务状态',
    value: serviceCountText.value,
    desc: '正常服务数 / 总服务数',
    color: '#f6b74b',
    background: 'rgba(246, 183, 75, 0.16)',
    icon: CloudServerOutlined
  }
])

const quickLinks = [
  { title: '用户管理', path: '/system/user', icon: UserOutlined },
  { title: '角色管理', path: '/system/role', icon: TeamOutlined },
  { title: '操作日志', path: '/monitor/operlog', icon: FileTextOutlined },
  { title: '系统设置', path: '/system/config', icon: SettingOutlined },
  { title: '服务状态', path: '/monitor/service', icon: CloudServerOutlined },
  { title: '在线用户', path: '/monitor/online', icon: SafetyCertificateOutlined }
]

function formatDateTime(date) {
  const pad = value => String(value).padStart(2, '0')
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('-') + 'T' + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join(':')
}

function todayRange() {
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  return {
    beginTime: formatDateTime(start),
    endTime: formatDateTime(end)
  }
}

function formatBusinessType(value) {
  if (value === undefined || value === null || value === '') return '-'
  return businessTypeMap[Number(value)] || value
}

function serviceStatusColor(status) {
  if (status === 'UP') return 'green'
  if (status === 'DOWN' || status === 'OFFLINE') return 'red'
  return 'orange'
}

function firstServiceTarget(item) {
  const instance = item.instances?.[0]
  return instance?.serviceUrl || instance?.instanceId || '暂无实例地址'
}

function formatDisplayTime(value) {
  if (!value) return '-'
  return String(value).replace('T', ' ')
}

function setPageTotal(target, res) {
  target.value = Number.isFinite(Number(res?.total)) ? Number(res.total) : 0
}

async function loadDashboard() {
  loading.value = true
  const range = todayRange()
  try {
    const [onlineRes, serviceRes, recentRes, todayRes, errorRes] = await Promise.allSettled([
      request.get('/monitor/online'),
      request.get('/monitor/service'),
      request.get('/monitor/operlog', { params: { pageNum: 1, pageSize: 5 } }),
      request.get('/monitor/operlog', { params: { pageNum: 1, pageSize: 1, ...range } }),
      request.get('/monitor/operlog', { params: { pageNum: 1, pageSize: 1, status: 1, ...range } })
    ])

    if (onlineRes.status === 'fulfilled') onlineUsers.value = Array.isArray(onlineRes.value) ? onlineRes.value : []
    if (serviceRes.status === 'fulfilled') services.value = Array.isArray(serviceRes.value) ? serviceRes.value : []
    if (recentRes.status === 'fulfilled') recentLogs.value = recentRes.value?.records || []
    if (todayRes.status === 'fulfilled') setPageTotal(todayTotal, todayRes.value)
    if (errorRes.status === 'fulfilled') setPageTotal(todayError, errorRes.value)
  } finally {
    loading.value = false
  }
}

function go(path) {
  router.push(path)
}

onMounted(loadDashboard)
</script>

<style scoped>
.dashboard-page {
  gap: 18px;
}

.dashboard-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(31, 79, 191, 0.1), rgba(99, 214, 133, 0.06)),
    var(--app-panel);
  box-shadow: var(--app-shadow);
}

.hero-kicker {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 600;
}

.dashboard-hero h2 {
  margin: 4px 0 0;
  color: var(--app-text);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.35;
}

.dashboard-hero p {
  margin: 6px 0 0;
  color: var(--app-text-secondary);
  font-size: 13px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card :deep(.ant-card-body) {
  height: 100%;
}

.stat-card-body {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 78px;
}

.stat-icon {
  display: grid;
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 8px;
  font-size: 23px;
}

.stat-content {
  min-width: 0;
}

.stat-title {
  color: var(--app-text-muted);
  font-size: 13px;
  font-weight: 600;
}

.stat-value {
  margin-top: 4px;
  font-size: 25px;
  font-weight: 800;
  line-height: 1.1;
}

.stat-desc {
  margin-top: 4px;
  color: var(--app-text-muted);
  font-size: 12px;
}

.dashboard-main {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.75fr);
  gap: 16px;
}

.recent-panel {
  min-height: 360px;
}

.log-list,
.service-list,
.side-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.service-item {
  position: relative;
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-bg-soft);
}

.service-dot {
  display: block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #52c41a;
  box-shadow: 0 0 0 4px rgba(82, 196, 26, 0.12);
}

.service-item.unhealthy .service-dot {
  background: #ff4d4f;
  box-shadow: 0 0 0 4px rgba(255, 77, 79, 0.12);
}

.service-main {
  min-width: 0;
}

.service-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.log-list {
  gap: 10px;
}

.log-item {
  position: relative;
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr) 160px;
  gap: 12px;
  align-items: center;
  padding: 13px 14px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-bg-soft);
}

.log-dot {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #52c41a;
  box-shadow: 0 0 0 4px rgba(82, 196, 26, 0.12);
}

.log-item.failed .log-dot {
  background: #ff4d4f;
  box-shadow: 0 0 0 4px rgba(255, 77, 79, 0.12);
}

.log-content {
  min-width: 0;
}

.log-topline {
  display: flex;
  align-items: center;
  gap: 10px;
}

.log-title {
  color: var(--app-text);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-meta-grid {
  display: grid;
  grid-template-columns: minmax(90px, 0.8fr) minmax(80px, 0.7fr) minmax(76px, 0.65fr) minmax(130px, 1.15fr);
  gap: 8px;
  margin-top: 9px;
}

.log-meta-item {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 5px;
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-meta-item .anticon {
  color: var(--app-text-muted);
}

.log-time {
  justify-self: end;
  color: var(--app-text-secondary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  white-space: nowrap;
}

.service-name {
  min-width: 0;
  color: var(--app-text);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.service-status {
  flex: 0 0 auto;
  margin-inline-end: 0;
  font-size: 12px;
}

.service-meta-grid {
  display: grid;
  grid-template-columns: 78px minmax(0, 1fr);
  gap: 8px;
  margin-top: 7px;
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.35;
}

.service-meta-grid span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  color: var(--app-text);
  background: var(--app-bg-soft);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.quick-link:hover {
  border-color: #1f4fbf;
  color: #1f4fbf;
  background: var(--app-primary-soft);
}

.quick-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  color: #1f4fbf;
  background: var(--app-primary-soft);
}

@media (max-width: 1180px) {
  .dashboard-grid,
  .dashboard-main {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .dashboard-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .dashboard-grid,
  .dashboard-main,
  .quick-grid {
    grid-template-columns: 1fr;
  }

  .log-item {
    grid-template-columns: 12px minmax(0, 1fr);
  }

  .log-time {
    grid-column: 2;
    justify-self: start;
  }

  .log-meta-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
