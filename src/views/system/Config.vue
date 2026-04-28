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
                  <a-tag color="blue">已启用</a-tag>
                </div>

                <div class="setting-field">
                  <div class="setting-label">
                    <span>密码最小长度</span>
                    <small>建议不少于 8 位</small>
                  </div>
                  <div class="setting-control has-unit">
                    <a-input-number v-model:value="passwordForm['password.min.length']" :min="6" :max="20" />
                    <span>位</span>
                  </div>
                </div>

                <div class="setting-group-title">组成规则</div>
                <div class="setting-check-grid">
                  <a-checkbox v-model:checked="passwordForm['password.require.number']">数字</a-checkbox>
                  <a-checkbox v-model:checked="passwordForm['password.require.lowercase']">小写字母</a-checkbox>
                  <a-checkbox v-model:checked="passwordForm['password.require.uppercase']">大写字母</a-checkbox>
                  <a-checkbox v-model:checked="passwordForm['password.require.special']">特殊字符</a-checkbox>
                </div>
              </section>

              <section class="setting-section">
                <div class="setting-section-head">
                  <div>
                    <h3>策略预览</h3>
                    <p>保存后注册、重置密码等场景将按此规则校验</p>
                  </div>
                </div>
                <div class="policy-summary">
                  <div class="policy-summary-number">{{ passwordForm['password.min.length'] || '-' }}</div>
                  <div>
                    <div class="policy-summary-title">最小密码长度</div>
                    <div class="policy-summary-desc">当前已启用 {{ activePasswordRules.length }} 项复杂度规则</div>
                  </div>
                </div>
                <div class="policy-tags">
                  <a-tag v-for="tag in activePasswordRules" :key="tag" color="processing">{{ tag }}</a-tag>
                  <span v-if="!activePasswordRules.length" class="muted-text">暂未启用复杂度规则</span>
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
                </div>

                <div class="setting-field">
                  <div class="setting-label">
                    <span>同一用户在线阈值</span>
                    <small>超过阈值后限制新的会话</small>
                  </div>
                  <div class="setting-control has-unit">
                    <a-input-number v-model:value="accountForm['account.online.threshold']" :min="1" :max="10" />
                    <span>个</span>
                  </div>
                </div>
                <div class="setting-field">
                  <div class="setting-label">
                    <span>IP 登录失败最大次数</span>
                    <small>单个 IP 在锁定周期内允许的失败次数</small>
                  </div>
                  <div class="setting-control has-unit">
                    <a-input-number v-model:value="accountForm['account.ip.fail.max']" :min="3" :max="20" />
                    <span>次</span>
                  </div>
                </div>
                <div class="setting-field">
                  <div class="setting-label">
                    <span>账号登录失败最大次数</span>
                    <small>单个账号在锁定周期内允许的失败次数</small>
                  </div>
                  <div class="setting-control has-unit">
                    <a-input-number v-model:value="accountForm['account.account.fail.max']" :min="3" :max="20" />
                    <span>次</span>
                  </div>
                </div>
                <div class="setting-field">
                  <div class="setting-label">
                    <span>锁定时长</span>
                    <small>触发保护后的账号冻结时间</small>
                  </div>
                  <div class="setting-control has-unit">
                    <a-input-number v-model:value="accountForm['account.lock.duration']" :min="5" :max="1440" />
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
                  <div class="account-stat">
                    <span>{{ accountForm['account.online.threshold'] || '-' }}</span>
                    <small>同用户在线阈值</small>
                  </div>
                  <div class="account-stat">
                    <span>{{ accountForm['account.ip.fail.max'] || '-' }}</span>
                    <small>IP 失败次数</small>
                  </div>
                  <div class="account-stat">
                    <span>{{ accountForm['account.account.fail.max'] || '-' }}</span>
                    <small>账号失败次数</small>
                  </div>
                  <div class="account-stat">
                    <span>{{ accountForm['account.lock.duration'] || '-' }}</span>
                    <small>锁定分钟数</small>
                  </div>
                </div>
              </section>
            </template>

            <template v-if="activeType === 'WATERMARK'">
              <section class="setting-section">
                <div class="setting-section-head">
                  <div>
                    <h3>水印设置</h3>
                    <p>控制页面水印内容和展示强度</p>
                  </div>
                  <a-switch v-model:checked="watermarkForm['watermark.enabled']" />
                </div>

                <div class="setting-field">
                  <div class="setting-label">
                    <span>水印文本</span>
                    <small>显示在业务页面上的水印内容</small>
                  </div>
                  <a-input v-model:value="watermarkForm['watermark.text']" class="setting-input" />
                </div>
                <div class="setting-field">
                  <div class="setting-label">
                    <span>透明度</span>
                    <small>数值越高，水印越明显</small>
                  </div>
                  <div class="setting-control has-unit">
                    <a-input-number v-model:value="watermarkForm['watermark.opacity']" :min="0.1" :max="1" :step="0.1" />
                    <span>opacity</span>
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
                  <span :style="{ opacity: watermarkForm['watermark.opacity'] || 0.2 }">
                    {{ watermarkForm['watermark.text'] || 'Atlas' }}
                  </span>
                  <span :style="{ opacity: watermarkForm['watermark.opacity'] || 0.2 }">
                    {{ watermarkForm['watermark.text'] || 'Atlas' }}
                  </span>
                  <span :style="{ opacity: watermarkForm['watermark.opacity'] || 0.2 }">
                    {{ watermarkForm['watermark.text'] || 'Atlas' }}
                  </span>
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
import { getConfigByType, updateConfig } from '@/api/config'

const activeType = ref('PASSWORD')
const loading = ref(false)
const saving = ref(false)
const passwordForm = ref({})
const accountForm = ref({})
const watermarkForm = ref({})

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
  const rules = []
  if (form['password.require.number']) rules.push('数字')
  if (form['password.require.lowercase']) rules.push('小写字母')
  if (form['password.require.uppercase']) rules.push('大写字母')
  if (form['password.require.special']) rules.push('特殊字符')
  return rules
})

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
      passwordForm.value = formData
    } else if (configType === 'ACCOUNT') {
      accountForm.value = formData
    } else if (configType === 'WATERMARK') {
      watermarkForm.value = formData
    }
  } catch (error) {
    message.error('加载配置失败')
  } finally {
    loading.value = false
  }
}

const parseValue = (value) => {
  if (value === 'true') return true
  if (value === 'false') return false
  if (!isNaN(value)) return Number(value)
  return value
}

const switchType = (key) => {
  if (activeType.value === key) return
  activeType.value = key
  loadConfig(key)
}

const handleSave = async (configType) => {
  saving.value = true
  try {
    let formData = {}
    if (configType === 'PASSWORD') {
      formData = passwordForm.value
    } else if (configType === 'ACCOUNT') {
      formData = accountForm.value
    } else if (configType === 'WATERMARK') {
      formData = watermarkForm.value
    }

    const configs = Object.keys(formData).map(key => ({
      configKey: key,
      configValue: String(formData[key]),
      configType
    }))

    for (const config of configs) {
      await updateConfig(config)
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

.account-stat small {
  display: block;
  margin-top: 8px;
  color: var(--app-text-muted);
  font-size: 12px;
}

.watermark-preview {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  min-height: 180px;
  padding: 18px;
  overflow: hidden;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-bg-soft);
}

.watermark-preview span {
  align-self: center;
  justify-self: center;
  color: #1f4fbf;
  font-size: 18px;
  font-weight: 700;
  transform: rotate(-24deg);
  white-space: nowrap;
}

.watermark-preview.disabled span {
  color: var(--app-text-muted);
  text-decoration: line-through;
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

  .watermark-preview {
    grid-template-columns: 1fr;
  }
}

:global(html.dark) .settings-main {
  background: linear-gradient(180deg, #141820, var(--app-panel) 160px);
}

:global(html.dark) .settings-nav-item:hover,
:global(html.dark) .settings-nav-item.active {
  color: #76a7ff;
  background: rgba(79, 140, 255, 0.14);
}

:global(html.dark) .settings-nav-item.active .settings-nav-icon {
  background: #2f6cf6;
}

:global(html.dark) .settings-header-icon,
:global(html.dark) .policy-summary-number {
  color: #76a7ff;
  background: rgba(79, 140, 255, 0.14);
}

:global(html.dark) .setting-section,
:global(html.dark) .setting-check-grid .ant-checkbox-wrapper,
:global(html.dark) .policy-summary,
:global(html.dark) .account-stat,
:global(html.dark) .watermark-preview,
:global(html.dark) .setting-control.has-unit > span {
  background: #141820;
}

:global(html.dark) .account-stat span,
:global(html.dark) .watermark-preview span {
  color: #76a7ff;
}
</style>
