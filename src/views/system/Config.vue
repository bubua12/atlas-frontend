<template>
  <div class="page-shell settings-page">
    <div class="settings-workspace">
      <aside class="settings-side">
        <div class="settings-side-heading">
          <div class="settings-side-title">系统设置</div>
          <div class="settings-side-desc">基础策略配置</div>
        </div>
        <button
          v-for="item in settingNav"
          :key="item.key"
          class="settings-nav-item"
          :class="{ active: activeType === item.key }"
          type="button"
          @click="switchType(item.key)"
        >
          <span class="settings-nav-icon"><component :is="item.icon" /></span>
          <span class="settings-nav-text">
            <span>{{ item.title }}</span>
            <small>{{ item.desc }}</small>
          </span>
        </button>
      </aside>

      <div class="settings-main">
        <div class="settings-header">
          <div class="settings-header-main">
            <span class="settings-header-icon"><component :is="activeNav.icon" /></span>
            <span>
              <h2>{{ activeNav.title }}</h2>
              <p>{{ activeNav.longDesc }}</p>
            </span>
          </div>
          <a-button type="primary" :loading="saving" @click="handleSave(activeType)">
            <template #icon><SaveOutlined /></template>
            保存
          </a-button>
        </div>

        <a-spin :spinning="loading">
          <div class="settings-content">
            <template v-if="activeType === 'PASSWORD'">
              <section class="setting-section">
                <div class="setting-section-head">
                  <div>
                    <h3>密码校验规则</h3>
                    <p>控制新密码必须满足的复杂度要求</p>
                  </div>
                  <div class="setting-section-actions">
                    <a-tag :color="passwordForm['password.enabled'] ? 'processing' : 'default'">
                      {{ passwordForm['password.enabled'] ? '已启用' : '未启用' }}
                    </a-tag>
                    <a-switch v-model:checked="passwordForm['password.enabled']" />
                  </div>
                </div>

                <div class="setting-field">
                  <div class="setting-label">
                    <span>密码最小长度</span>
                    <small>建议不少于 8 位</small>
                  </div>
                  <div class="setting-control has-unit">
                    <a-input-number
                      v-model:value="passwordForm['password.min.length']"
                      :min="6"
                      :max="20"
                      :disabled="!passwordForm['password.enabled']"
                    />
                    <span>位</span>
                  </div>
                </div>

                <div class="setting-group-title">组成规则</div>
                <div class="setting-check-grid">
                  <a-checkbox
                    v-model:checked="passwordForm['password.require.number']"
                    :disabled="!passwordForm['password.enabled']"
                  >
                    数字
                  </a-checkbox>
                  <a-checkbox
                    v-model:checked="passwordForm['password.require.lowercase']"
                    :disabled="!passwordForm['password.enabled']"
                  >
                    小写字母
                  </a-checkbox>
                  <a-checkbox
                    v-model:checked="passwordForm['password.require.uppercase']"
                    :disabled="!passwordForm['password.enabled']"
                  >
                    大写字母
                  </a-checkbox>
                  <a-checkbox
                    v-model:checked="passwordForm['password.require.special']"
                    :disabled="!passwordForm['password.enabled']"
                  >
                    特殊字符
                  </a-checkbox>
                </div>
              </section>

              <section class="setting-section">
                <div class="setting-section-head">
                  <div>
                    <h3>策略预览</h3>
                    <p>保存后注册、重置密码等场景将按此规则校验</p>
                  </div>
                </div>
                <div class="policy-summary" :class="{ disabled: !passwordForm['password.enabled'] }">
                  <div class="policy-summary-number">
                    {{ passwordForm['password.enabled'] ? (passwordForm['password.min.length'] || '-') : '--' }}
                  </div>
                  <div>
                    <div class="policy-summary-title">
                      {{ passwordForm['password.enabled'] ? '最小密码长度' : '密码策略未启用' }}
                    </div>
                    <div class="policy-summary-desc">
                      {{ passwordForm['password.enabled']
                        ? `当前已启用 ${activePasswordRules.length} 项复杂度规则`
                        : '保存后密码复杂度规则将不参与校验' }}
                    </div>
                  </div>
                </div>
                <div class="policy-tags">
                  <template v-if="passwordForm['password.enabled']">
                    <a-tag v-for="tag in activePasswordRules" :key="tag" color="processing">{{ tag }}</a-tag>
                    <span v-if="!activePasswordRules.length" class="muted-text">暂未启用复杂度规则</span>
                  </template>
                  <span v-else class="muted-text">密码策略总开关已关闭</span>
                </div>
              </section>
            </template>

            <template v-if="activeType === 'ACCOUNT'">
              <section class="setting-section">
                <div class="setting-section-head">
                  <div>
                    <h3>登录保护</h3>
                    <p>配置在线会话数量、失败次数和锁定时长</p>
                  </div>
                  <div class="setting-section-actions">
                    <a-tag :color="accountForm['account.enabled'] ? 'processing' : 'default'">
                      {{ accountForm['account.enabled'] ? '已启用' : '未启用' }}
                    </a-tag>
                    <a-switch v-model:checked="accountForm['account.enabled']" />
                  </div>
                </div>

                <div class="setting-field">
                  <div class="setting-label">
                    <span>同一用户在线阈值</span>
                    <small>超过阈值后限制新的会话</small>
                  </div>
                  <div class="setting-control has-unit">
                    <a-input-number
                      v-model:value="accountForm['account.online.threshold']"
                      :min="1"
                      :max="10"
                      :disabled="!accountForm['account.enabled']"
                    />
                    <span>个</span>
                  </div>
                </div>
                <div class="setting-field">
                  <div class="setting-label">
                    <span>IP 登录失败最大次数</span>
                    <small>单个 IP 在锁定周期内允许的失败次数</small>
                  </div>
                  <div class="setting-control has-unit">
                    <a-input-number
                      v-model:value="accountForm['account.ip.fail.max']"
                      :min="3"
                      :max="20"
                      :disabled="!accountForm['account.enabled']"
                    />
                    <span>次</span>
                  </div>
                </div>
                <div class="setting-field">
                  <div class="setting-label">
                    <span>账号登录失败最大次数</span>
                    <small>单个账号在锁定周期内允许的失败次数</small>
                  </div>
                  <div class="setting-control has-unit">
                    <a-input-number
                      v-model:value="accountForm['account.account.fail.max']"
                      :min="3"
                      :max="20"
                      :disabled="!accountForm['account.enabled']"
                    />
                    <span>次</span>
                  </div>
                </div>
                <div class="setting-field">
                  <div class="setting-label">
                    <span>锁定时长</span>
                    <small>触发保护后的账号冻结时间</small>
                  </div>
                  <div class="setting-control has-unit">
                    <a-input-number
                      v-model:value="accountForm['account.lock.duration']"
                      :min="5"
                      :max="1440"
                      :disabled="!accountForm['account.enabled']"
                    />
                    <span>分钟</span>
                  </div>
                </div>
              </section>

              <section class="setting-section">
                <div class="setting-section-head">
                  <div>
                    <h3>策略说明</h3>
                    <p>帮助管理员快速确认当前保护强度</p>
                  </div>
                </div>
                <div class="account-stat-list">
                  <div class="account-stat" :class="{ disabled: !accountForm['account.enabled'] }">
                    <span>{{ accountForm['account.enabled'] ? (accountForm['account.online.threshold'] || '-') : '--' }}</span>
                    <small>同用户在线阈值</small>
                  </div>
                  <div class="account-stat" :class="{ disabled: !accountForm['account.enabled'] }">
                    <span>{{ accountForm['account.enabled'] ? (accountForm['account.ip.fail.max'] || '-') : '--' }}</span>
                    <small>IP 失败次数</small>
                  </div>
                  <div class="account-stat" :class="{ disabled: !accountForm['account.enabled'] }">
                    <span>{{ accountForm['account.enabled'] ? (accountForm['account.account.fail.max'] || '-') : '--' }}</span>
                    <small>账号失败次数</small>
                  </div>
                  <div class="account-stat" :class="{ disabled: !accountForm['account.enabled'] }">
                    <span>{{ accountForm['account.enabled'] ? (accountForm['account.lock.duration'] || '-') : '--' }}</span>
                    <small>锁定分钟数</small>
                  </div>
                </div>
              </section>
            </template>

            <template v-if="activeType === 'WATERMARK'">
              <section class="setting-section watermark-editor-section">
                <div class="setting-section-head">
                  <div>
                    <h3>页面水印</h3>
                    <p>启用后，登录后的业务页面将显示水印</p>
                  </div>
                  <div class="setting-section-actions">
                    <a-tag :color="watermarkForm['watermark.enabled'] ? 'processing' : 'default'">
                      {{ watermarkForm['watermark.enabled'] ? '已启用' : '未启用' }}
                    </a-tag>
                    <a-switch v-model:checked="watermarkForm['watermark.enabled']" />
                  </div>
                </div>

                <div class="setting-field">
                  <div class="setting-label">
                    <span>默认内容</span>
                    <small>未启用自定义文本时使用</small>
                  </div>
                  <a-input v-model:value="watermarkForm['watermark.text']" class="setting-input" />
                </div>

                <div class="watermark-config-block">
                  <div class="watermark-config-head">
                    <div>
                      <h4>自定义文本</h4>
                      <p>启用后，水印内容将使用自定义文字和变量</p>
                    </div>
                    <a-switch v-model:checked="watermarkForm['watermark.custom.enabled']" />
                  </div>

                  <div class="watermark-form-line">
                    <label>自定义内容</label>
                    <a-input
                      v-model:value="watermarkForm['watermark.custom.content']"
                      :disabled="!watermarkForm['watermark.custom.enabled']"
                      class="setting-input"
                    />
                  </div>

                  <div class="watermark-token-row">
                    <button
                      v-for="item in watermarkTokens"
                      :key="item.token"
                      type="button"
                      @click="insertWatermarkToken(item.token)"
                    >
                      + {{ item.label }}
                    </button>
                  </div>

                  <div class="watermark-form-line">
                    <label>字体大小</label>
                    <a-input-number
                      v-model:value="watermarkForm['watermark.font.size']"
                      :min="10"
                      :max="48"
                      class="watermark-full-control"
                    />
                  </div>

                  <div class="watermark-form-line">
                    <label>透明度</label>
                    <div class="watermark-opacity-control">
                      <a-slider v-model:value="watermarkForm['watermark.opacity']" :min="0" :max="1" :step="0.01" />
                      <a-input-number
                        v-model:value="watermarkForm['watermark.opacity']"
                        :min="0"
                        :max="1"
                        :step="0.01"
                      />
                    </div>
                  </div>

                  <div class="watermark-form-line">
                    <label>水印密度</label>
                    <div class="watermark-density-control">
                      <a-slider
                        v-model:value="watermarkForm['watermark.density']"
                        :marks="watermarkDensityMarks"
                        :min="1"
                        :max="5"
                        :step="1"
                      />
                      <a-input-number
                        v-model:value="watermarkForm['watermark.density']"
                        :min="1"
                        :max="5"
                        :step="1"
                      />
                    </div>
                  </div>

                  <div class="watermark-form-line">
                    <label>字体</label>
                    <a-select
                      v-model:value="watermarkForm['watermark.font.family']"
                      :options="watermarkFontOptions"
                      class="watermark-full-control"
                    />
                  </div>

                  <div class="watermark-form-line">
                    <label>字体颜色</label>
                    <div class="watermark-color-row">
                      <button
                        v-for="color in watermarkColorPresets"
                        :key="color"
                        class="watermark-color-swatch"
                        :class="{ active: watermarkForm['watermark.font.color'] === color }"
                        :style="{ '--swatch-color': color }"
                        type="button"
                        :aria-label="`选择颜色 ${color}`"
                        @click="watermarkForm['watermark.font.color'] = color"
                      />
                      <label class="watermark-custom-color">
                        <input v-model="watermarkForm['watermark.font.color']" type="color" />
                        <span>自定义</span>
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              <section class="setting-section">
                <div class="setting-section-head">
                  <div>
                    <h3>水印预览</h3>
                    <p>根据当前文本和透明度生成预览效果</p>
                  </div>
                </div>
                <div class="watermark-preview" :class="{ disabled: !watermarkForm['watermark.enabled'] }">
                  <a-watermark
                    class="watermark-preview-mark"
                    :content="watermarkPreviewContent"
                    :font="watermarkPreviewFont"
                    :gap="watermarkPreviewGap"
                    :height="32"
                    :rotate="-24"
                    :z-index="2"
                  >
                    <div class="watermark-preview-surface">
                      <div class="preview-toolbar">
                        <i />
                        <i />
                        <i />
                      </div>
                      <div class="preview-grid">
                        <div class="preview-panel primary">
                          <b />
                          <span />
                          <span />
                        </div>
                        <div class="preview-panel">
                          <b />
                          <span />
                          <span />
                        </div>
                      </div>
                      <div class="preview-table">
                        <i v-for="item in 12" :key="item" />
                      </div>
                    </div>
                  </a-watermark>
                  <div v-if="!watermarkForm['watermark.enabled']" class="watermark-preview-mask">未启用</div>
                </div>
              </section>
            </template>
          </div>
        </a-spin>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  FileImageOutlined,
  LockOutlined,
  SaveOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import { getConfigByType, updateConfigs } from '@/api/config'
import { useUserStore } from '@/stores/user'
import { useWatermarkStore } from '@/stores/watermark'

const activeType = ref('PASSWORD')
const loading = ref(false)
const saving = ref(false)
const passwordForm = ref({})
const accountForm = ref({})
const watermarkForm = ref({})
const userStore = useUserStore()
const watermarkStore = useWatermarkStore()

// 水印模板变量快捷按钮，保存到后端的是占位符字符串。
const watermarkTokens = [
  { label: '登录人名称', token: '${loginName}' },
  { label: '登录工号', token: '${employeeNo}' },
  { label: '登录人电话', token: '${phone}' },
  { label: '登录部门', token: '${deptName}' },
  { label: '登录人所属公司', token: '${companyName}' },
  { label: '当前时间', token: '${currentTime}' }
]
// 后端会校验字体枚举，前端选项需要和 SysConfigDefinition 保持一致。
const watermarkFontOptions = [
  { label: 'Microsoft YaHei', value: 'Microsoft YaHei' },
  { label: 'PingFang SC', value: 'PingFang SC' },
  { label: 'SimSun', value: 'SimSun' },
  { label: 'KaiTi', value: 'KaiTi' },
  { label: 'Arial', value: 'Arial' }
]
const watermarkColorPresets = ['#111827', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6']
const watermarkDensityMarks = {
  1: '稀疏',
  3: '标准',
  5: '密集'
}
// 预览区域比全局页面小，使用单独的 gap 映射保证密度观感一致。
const watermarkPreviewDensityGaps = {
  1: [168, 132],
  2: [140, 110],
  3: [112, 86],
  4: [92, 72],
  5: [76, 60]
}
const settingNav = [
  {
    key: 'PASSWORD',
    title: '密码设置',
    desc: '强度规则',
    longDesc: '维护密码复杂度、最小长度和登录安全策略',
    icon: LockOutlined
  },
  {
    key: 'ACCOUNT',
    title: '账号设置',
    desc: '登录保护',
    longDesc: '配置登录失败锁定、在线阈值和账号保护策略',
    icon: UserOutlined
  },
  {
    key: 'WATERMARK',
    title: '水印设置',
    desc: '页面水印',
    longDesc: '配置系统页面水印文案、启用状态和透明度',
    icon: FileImageOutlined
  }
]

const activeNav = computed(() => settingNav.find(item => item.key === activeType.value) || settingNav[0])
const activePasswordRules = computed(() => {
  const form = passwordForm.value
  if (!form['password.enabled']) return []
  const rules = []
  if (form['password.require.number']) rules.push('数字')
  if (form['password.require.lowercase']) rules.push('小写字母')
  if (form['password.require.uppercase']) rules.push('大写字母')
  if (form['password.require.special']) rules.push('特殊字符')
  return rules
})
// 预览使用和全局水印相同的模板变量替换规则。
const watermarkPreviewContent = computed(() => {
  if (!watermarkForm.value['watermark.enabled']) return ''
  const template = watermarkForm.value['watermark.custom.enabled']
    ? watermarkForm.value['watermark.custom.content']
    : watermarkForm.value['watermark.text']
  return resolveWatermarkTemplate(normalizeText(template))
})
// 预览字体颜色需要把色值和透明度合成为 rgba。
const watermarkPreviewFont = computed(() => ({
  color: hexToRgba(
    normalizeColor(watermarkForm.value['watermark.font.color']),
    normalizeOpacity(watermarkForm.value['watermark.opacity'])
  ),
  fontSize: normalizeFontSize(watermarkForm.value['watermark.font.size']),
  fontWeight: 700,
  fontFamily: watermarkForm.value['watermark.font.family'] || 'Microsoft YaHei'
}))
const watermarkPreviewGap = computed(() => {
  const density = normalizeDensity(watermarkForm.value['watermark.density'])
  return watermarkPreviewDensityGaps[density] || watermarkPreviewDensityGaps[3]
})

// 按当前设置分组加载配置，并把后端字符串值转换成表单控件需要的类型。
const loadConfig = async (configType) => {
  loading.value = true
  try {
    const res = await getConfigByType(configType)
    const list = Array.isArray(res) ? res : []
    const formData = {}
    list.forEach(item => {
      formData[item.configKey] = parseValue(item.configValue)
    })

    if (configType === 'PASSWORD') {
      passwordForm.value = normalizePasswordForm(formData)
    } else if (configType === 'ACCOUNT') {
      accountForm.value = normalizeAccountForm(formData)
    } else if (configType === 'WATERMARK') {
      watermarkForm.value = normalizeWatermarkForm(formData)
    }
  } catch (error) {
    message.error('加载配置失败')
  } finally {
    loading.value = false
  }
}

// sys_config 统一存字符串，前端加载时按常见类型转成 boolean/number。
const parseValue = (value) => {
  if (value === null || value === undefined) return ''
  if (value === 'true') return true
  if (value === 'false') return false
  if (value !== '' && !Number.isNaN(Number(value))) return Number(value)
  return value
}

const normalizeBooleanValue = (value, defaultValue = false) => {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === null || value === undefined || value === '') return defaultValue
  return Boolean(value)
}

const normalizeIntegerRange = (value, defaultValue, min, max) => {
  const numberValue = Number(value)
  if (Number.isNaN(numberValue)) return defaultValue
  return Math.min(max, Math.max(min, Math.round(numberValue)))
}

const normalizeText = (value) => {
  const text = typeof value === 'string' ? value.trim() : ''
  return text || 'Atlas System'
}

const normalizeOpacity = (value) => {
  const opacity = Number(value)
  if (Number.isNaN(opacity)) return 0.1
  return Math.min(1, Math.max(0, opacity))
}

// 密码设置总开关默认开启，兼容旧库缺少 password.enabled 的场景。
const normalizePasswordForm = (formData = {}) => ({
  'password.enabled': normalizeBooleanValue(formData['password.enabled'], true),
  'password.min.length': normalizeIntegerRange(formData['password.min.length'], 8, 6, 20),
  'password.require.uppercase': normalizeBooleanValue(formData['password.require.uppercase'], true),
  'password.require.lowercase': normalizeBooleanValue(formData['password.require.lowercase'], true),
  'password.require.number': normalizeBooleanValue(formData['password.require.number'], true),
  'password.require.special': normalizeBooleanValue(formData['password.require.special'], false)
})

// 账号保护总开关默认开启；关闭后后端不再应用登录锁定和在线阈值。
const normalizeAccountForm = (formData = {}) => ({
  'account.enabled': normalizeBooleanValue(formData['account.enabled'], true),
  'account.online.threshold': normalizeIntegerRange(formData['account.online.threshold'], 1, 1, 10),
  'account.ip.fail.max': normalizeIntegerRange(formData['account.ip.fail.max'], 5, 3, 20),
  'account.account.fail.max': normalizeIntegerRange(formData['account.account.fail.max'], 5, 3, 20),
  'account.lock.duration': normalizeIntegerRange(formData['account.lock.duration'], 30, 5, 1440)
})

// 水印表单保存和预览前都走同一套归一化，保证提交值落在后端允许范围内。
const normalizeWatermarkForm = (formData = {}) => ({
  'watermark.enabled': Boolean(formData['watermark.enabled']),
  'watermark.text': normalizeText(formData['watermark.text']),
  'watermark.opacity': normalizeOpacity(formData['watermark.opacity']),
  'watermark.density': normalizeDensity(formData['watermark.density']),
  'watermark.custom.enabled': Boolean(formData['watermark.custom.enabled']),
  'watermark.custom.content': typeof formData['watermark.custom.content'] === 'string'
    ? formData['watermark.custom.content']
    : '',
  'watermark.font.size': normalizeFontSize(formData['watermark.font.size']),
  'watermark.font.family': formData['watermark.font.family'] || 'Microsoft YaHei',
  'watermark.font.color': normalizeColor(formData['watermark.font.color'])
})

const normalizeFontSize = (value) => {
  const fontSize = Number(value)
  if (Number.isNaN(fontSize)) return 14
  return Math.min(48, Math.max(10, fontSize))
}

const normalizeColor = (value) => /^#[0-9a-fA-F]{6}$/.test(value || '') ? value : '#8f96a3'

// 密度配置使用 1-5 的整数等级，数值越大水印越密。
const normalizeDensity = (value) => {
  const density = Number(value)
  if (Number.isNaN(density)) return 3
  return Math.min(5, Math.max(1, Math.round(density)))
}

// Ant Design Vue Watermark 需要最终颜色，透明度通过 rgba 合并进去。
const hexToRgba = (hex, opacity) => {
  const normalizedHex = normalizeColor(hex).replace('#', '')
  const red = parseInt(normalizedHex.slice(0, 2), 16)
  const green = parseInt(normalizedHex.slice(2, 4), 16)
  const blue = parseInt(normalizedHex.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${normalizeOpacity(opacity)})`
}

// 点击变量按钮时自动启用自定义文本，并把变量追加到模板末尾。
const insertWatermarkToken = (token) => {
  watermarkForm.value['watermark.custom.enabled'] = true
  const current = watermarkForm.value['watermark.custom.content'] || ''
  watermarkForm.value['watermark.custom.content'] = current ? `${current} ${token}` : token
}

// 预览区即时替换变量，保存到后端时仍然保留原始模板。
const resolveWatermarkTemplate = (template) => {
  const profile = userStore.profile || {}
  const values = {
    '${loginName}': profile.nickname || userStore.username || '登录人',
    '${employeeNo}': profile.employeeNo || profile.username || userStore.username || '工号',
    '${phone}': profile.phone || '电话',
    '${deptName}': profile.deptName || '部门',
    '${companyName}': profile.companyName || 'Atlas',
    '${currentTime}': formatDateTime(new Date())
  }
  return Object.entries(values).reduce((content, [token, value]) => {
    return content.split(token).join(value)
  }, template)
}

const formatDateTime = (date) => {
  const pad = value => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const switchType = (key) => {
  if (activeType.value === key) return
  activeType.value = key
  loadConfig(key)
}

// 当前页按激活分组保存，后端会再次校验 key、type 和 value。
const handleSave = async (configType) => {
  saving.value = true
  try {
    let formData = {}
    if (configType === 'PASSWORD') {
      const normalizedForm = normalizePasswordForm(passwordForm.value)
      passwordForm.value = normalizedForm
      formData = normalizedForm
    } else if (configType === 'ACCOUNT') {
      const normalizedForm = normalizeAccountForm(accountForm.value)
      accountForm.value = normalizedForm
      formData = normalizedForm
    } else if (configType === 'WATERMARK') {
      const normalizedForm = normalizeWatermarkForm(watermarkForm.value)
      if (
        normalizedForm['watermark.enabled']
        && normalizedForm['watermark.custom.enabled']
        && !String(watermarkForm.value['watermark.custom.content'] || '').trim()
      ) {
        message.warning('启用水印后需要填写水印文本')
        return
      }
      watermarkForm.value = normalizedForm
      formData = normalizedForm
    }

    const configs = Object.keys(formData).map(key => ({
      configKey: key,
      configValue: String(formData[key]),
      configType
    }))

    await updateConfigs(configs)
    if (configType === 'WATERMARK') {
      await watermarkStore.load(true).catch(() => watermarkStore.applyConfig({
        enabled: watermarkForm.value['watermark.enabled'],
        text: watermarkForm.value['watermark.text'],
        opacity: watermarkForm.value['watermark.opacity'],
        density: watermarkForm.value['watermark.density'],
        customEnabled: watermarkForm.value['watermark.custom.enabled'],
        customContent: watermarkForm.value['watermark.custom.content'],
        fontSize: watermarkForm.value['watermark.font.size'],
        fontFamily: watermarkForm.value['watermark.font.family'],
        fontColor: watermarkForm.value['watermark.font.color']
      }))
    }

    message.success('保存成功')
  } catch (error) {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadConfig('PASSWORD')
})
</script>

<style scoped>
.settings-page {
  min-height: calc(100vh - 96px);
}

.settings-workspace {
  display: grid;
  grid-template-columns: 232px minmax(0, 1fr);
  min-height: calc(100vh - 112px);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-panel);
  box-shadow: var(--app-shadow);
  overflow: hidden;
}

.settings-side {
  padding: 16px 0;
  border-right: 1px solid var(--app-border);
  background: var(--app-panel);
}

.settings-side-heading {
  padding: 0 18px 14px;
  border-bottom: 1px solid var(--app-border);
  margin-bottom: 8px;
}

.settings-side-title {
  color: var(--app-text);
  font-size: 16px;
  font-weight: 700;
}

.settings-side-desc {
  margin-top: 2px;
  color: var(--app-text-muted);
  font-size: 12px;
}

.settings-nav-item {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
  min-height: 58px;
  padding: 10px 18px;
  border: 0;
  border-left: 3px solid transparent;
  color: var(--app-text-secondary);
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.settings-nav-item:hover {
  color: #1f4fbf;
  background: var(--app-primary-soft);
}

.settings-nav-item.active {
  border-left-color: #1f4fbf;
  color: #1f4fbf;
  background: var(--app-primary-soft);
}

.settings-nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: var(--app-bg-soft);
}

.settings-nav-item.active .settings-nav-icon {
  color: #ffffff;
  background: #1f4fbf;
}

.settings-nav-text {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.settings-nav-text span {
  font-size: 14px;
  font-weight: 600;
}

.settings-nav-text small {
  margin-top: 2px;
  color: var(--app-text-muted);
  font-size: 12px;
}

.settings-main {
  min-width: 0;
  background: linear-gradient(180deg, var(--app-bg-soft), var(--app-panel) 160px);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 72px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--app-border);
  background: var(--app-panel);
}

.settings-header-main {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 12px;
}

.settings-header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  color: #1f4fbf;
  background: var(--app-primary-soft);
}

.settings-header h2 {
  margin: 0;
  color: var(--app-text);
  font-size: 19px;
  font-weight: 700;
  line-height: 1.35;
}

.settings-header p {
  margin: 3px 0 0;
  color: var(--app-text-muted);
  font-size: 12px;
}

.settings-content {
  display: grid;
  grid-template-columns: minmax(360px, 1fr) minmax(320px, 0.88fr);
  gap: 20px;
  padding: 20px;
}

.setting-section {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-panel);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.setting-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--app-border);
}

.setting-section-head h3 {
  margin: 0;
  color: var(--app-text);
  font-size: 16px;
  font-weight: 700;
}

.setting-section-head p {
  margin: 4px 0 0;
  color: var(--app-text-muted);
  font-size: 12px;
}

.setting-section-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 10px;
}

.setting-field {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(180px, 260px);
  align-items: center;
  gap: 18px;
  min-height: 58px;
  padding: 12px 0;
  border-bottom: 1px solid var(--app-border);
}

.setting-field:last-child {
  border-bottom: 0;
}

.setting-label {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.setting-label span {
  color: var(--app-text);
  font-size: 14px;
  font-weight: 600;
}

.setting-label small {
  margin-top: 4px;
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.45;
}

.setting-control {
  width: 100%;
}

.setting-control.has-unit {
  display: flex;
  align-items: center;
}

.setting-control.has-unit .ant-input-number {
  flex: 1;
  width: 100%;
  border-start-end-radius: 0;
  border-end-end-radius: 0;
}

.setting-control.has-unit > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--app-border-strong);
  border-left: 0;
  border-radius: 0 6px 6px 0;
  color: var(--app-text-secondary);
  background: var(--app-bg-soft);
  font-size: 13px;
}

.setting-input {
  width: 100%;
}

.watermark-editor-section {
  display: flex;
  flex-direction: column;
}

.watermark-config-block {
  padding-top: 16px;
  margin-top: 6px;
  border-top: 1px solid var(--app-border);
}

.watermark-config-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.watermark-config-head h4 {
  margin: 0;
  color: var(--app-text);
  font-size: 15px;
  font-weight: 700;
}

.watermark-config-head p {
  margin: 4px 0 0;
  color: var(--app-text-muted);
  font-size: 12px;
}

.watermark-form-line {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.watermark-form-line label {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 600;
}

.watermark-full-control {
  width: 100%;
}

.watermark-opacity-control,
.watermark-density-control {
  display: grid;
  grid-template-columns: minmax(120px, 1fr) 92px;
  align-items: center;
  gap: 12px;
}

.watermark-opacity-control .ant-slider,
.watermark-density-control .ant-slider {
  margin: 0 6px;
}

.watermark-opacity-control .ant-input-number,
.watermark-density-control .ant-input-number {
  width: 100%;
}

.watermark-token-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin-top: 12px;
}

.watermark-token-row button {
  padding: 0;
  border: 0;
  color: #445dff;
  background: transparent;
  font-size: 13px;
  cursor: pointer;
}

.watermark-token-row button:hover {
  color: #1f4fbf;
}

.watermark-color-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.watermark-color-swatch {
  width: 36px;
  height: 36px;
  padding: 5px;
  border: 1px solid var(--app-border);
  border-radius: 4px;
  background: var(--app-panel);
  cursor: pointer;
}

.watermark-color-swatch::before {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 2px;
  background: var(--swatch-color);
  content: '';
}

.watermark-color-swatch.active {
  border-color: #445dff;
  box-shadow: 0 0 0 1px rgba(68, 93, 255, 0.22);
}

.watermark-custom-color {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--app-border);
  border-radius: 4px;
  background: var(--app-panel);
  cursor: pointer;
}

.watermark-custom-color input {
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.watermark-custom-color span {
  color: var(--app-text-secondary);
  font-size: 13px;
}

.setting-group-title {
  margin: 4px 0 10px;
  color: var(--app-text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.setting-check-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.setting-check-grid .ant-checkbox-wrapper {
  margin-inline-start: 0;
  padding: 9px 10px;
  border: 1px solid var(--app-border);
  border-radius: 6px;
  background: var(--app-bg-soft);
}

.policy-summary {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-bg-soft);
}

.policy-summary.disabled {
  opacity: 0.72;
}

.policy-summary-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 8px;
  color: #1f4fbf;
  background: var(--app-primary-soft);
  font-size: 24px;
  font-weight: 800;
}

.policy-summary-title {
  color: var(--app-text);
  font-size: 15px;
  font-weight: 700;
}

.policy-summary-desc {
  margin-top: 3px;
  color: var(--app-text-muted);
  font-size: 12px;
}

.policy-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.account-stat-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.account-stat {
  padding: 14px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-bg-soft);
}

.account-stat span {
  display: block;
  color: #1f4fbf;
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
}

.account-stat.disabled {
  opacity: 0.72;
}

.account-stat.disabled span {
  color: var(--app-text-muted);
}

.account-stat small {
  display: block;
  margin-top: 8px;
  color: var(--app-text-muted);
  font-size: 12px;
}

.watermark-preview {
  position: relative;
  min-height: 240px;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-bg-soft);
}

.watermark-preview-mark {
  min-height: 240px;
}

.watermark-preview-surface {
  min-height: 240px;
  padding: 16px;
  background:
    linear-gradient(135deg, rgba(31, 79, 191, 0.06), transparent 42%),
    var(--app-panel);
}

.watermark-preview.disabled .watermark-preview-surface {
  opacity: 0.72;
  filter: saturate(0.42);
}

.preview-toolbar {
  display: flex;
  gap: 8px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--app-border);
}

.preview-toolbar i {
  display: block;
  width: 52px;
  height: 8px;
  border-radius: 999px;
  background: var(--app-border-strong);
}

.preview-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 12px;
  margin-top: 14px;
}

.preview-panel {
  display: grid;
  gap: 10px;
  min-height: 74px;
  padding: 12px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-bg-soft);
}

.preview-panel b,
.preview-panel span,
.preview-table i {
  display: block;
  border-radius: 999px;
  background: var(--app-border-strong);
}

.preview-panel b {
  width: 42%;
  height: 10px;
  background: rgba(31, 79, 191, 0.28);
}

.preview-panel span {
  width: 86%;
  height: 8px;
}

.preview-panel span:last-child {
  width: 64%;
}

.preview-panel.primary {
  background: var(--app-primary-soft);
}

.preview-table {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
  padding: 12px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
}

.preview-table i {
  height: 8px;
}

.watermark-preview-mask {
  position: absolute;
  z-index: 3;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--app-text-secondary);
  background: rgba(255, 255, 255, 0.58);
  font-size: 16px;
  font-weight: 700;
}

.watermark-preview-mask::before {
  position: absolute;
  width: 120px;
  height: 1px;
  background: var(--app-border-strong);
  content: '';
  transform: rotate(-18deg);
}

@media (max-width: 900px) {
  .settings-workspace {
    grid-template-columns: 1fr;
  }

  .settings-side {
    border-right: 0;
    border-bottom: 1px solid var(--app-border);
  }

  .settings-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .settings-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .setting-field {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .setting-check-grid,
  .account-stat-list {
    grid-template-columns: 1fr;
  }

  .preview-grid,
  .preview-table {
    grid-template-columns: 1fr;
  }
}

</style>
