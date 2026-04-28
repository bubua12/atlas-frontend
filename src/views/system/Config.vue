<template>
  <div class="page-shell">
    <a-card :bordered="false" class="page-panel">
      <div class="page-toolbar">
        <div class="page-title-block">
          <h2 class="page-title">系统设置</h2>
          <div class="page-subtitle">集中维护登录安全、账号策略和水印配置</div>
        </div>
      </div>
      <div class="config-layout">
        <div class="config-nav">
          <a-menu v-model:selectedKeys="selectedKeys" mode="inline" class="settings-menu" @select="handleMenuSelect">
            <a-menu-item key="PASSWORD">
              <template #icon><LockOutlined /></template>
              密码设置
            </a-menu-item>
            <a-menu-item key="ACCOUNT">
              <template #icon><UserOutlined /></template>
              账号设置
            </a-menu-item>
            <a-menu-item key="WATERMARK">
              <template #icon><FileImageOutlined /></template>
              水印设置
            </a-menu-item>
          </a-menu>
        </div>

        <div class="config-content">
            <div v-if="activeType === 'PASSWORD'">
              <div class="panel-heading">
                <div>
                  <h3 class="panel-heading-title">密码设置</h3>
                  <div class="panel-heading-desc">配置密码复杂度要求</div>
                </div>
              </div>
              <a-form :model="passwordForm" :label-col="{ span: 7 }" :wrapper-col="{ span: 14 }">
                <a-form-item label="最小长度">
                  <a-input-number v-model:value="passwordForm['password.min.length']" :min="6" :max="20" />
                </a-form-item>
                <a-form-item label="需要大写字母">
                  <a-switch v-model:checked="passwordForm['password.require.uppercase']" />
                </a-form-item>
                <a-form-item label="需要小写字母">
                  <a-switch v-model:checked="passwordForm['password.require.lowercase']" />
                </a-form-item>
                <a-form-item label="需要数字">
                  <a-switch v-model:checked="passwordForm['password.require.number']" />
                </a-form-item>
                <a-form-item label="需要特殊字符">
                  <a-switch v-model:checked="passwordForm['password.require.special']" />
                </a-form-item>
                <a-form-item :wrapper-col="{ offset: 7 }">
                  <a-button type="primary" @click="handleSave('PASSWORD')">
                    <template #icon><SaveOutlined /></template>
                    保存
                  </a-button>
                </a-form-item>
              </a-form>
            </div>

            <div v-if="activeType === 'ACCOUNT'">
              <div class="panel-heading">
                <div>
                  <h3 class="panel-heading-title">账号设置</h3>
                  <div class="panel-heading-desc">配置登录失败锁定和在线阈值</div>
                </div>
              </div>
              <a-form :model="accountForm" :label-col="{ span: 7 }" :wrapper-col="{ span: 14 }">
                <a-form-item label="同一用户在线阈值">
                  <a-input-number v-model:value="accountForm['account.online.threshold']" :min="1" :max="10" />
                </a-form-item>
                <a-form-item label="IP登录失败最大次数">
                  <a-input-number v-model:value="accountForm['account.ip.fail.max']" :min="3" :max="20" />
                </a-form-item>
                <a-form-item label="账号登录失败最大次数">
                  <a-input-number v-model:value="accountForm['account.account.fail.max']" :min="3" :max="20" />
                </a-form-item>
                <a-form-item label="锁定时长(分钟)">
                  <a-input-number v-model:value="accountForm['account.lock.duration']" :min="5" :max="1440" />
                </a-form-item>
                <a-form-item :wrapper-col="{ offset: 7 }">
                  <a-button type="primary" @click="handleSave('ACCOUNT')">
                    <template #icon><SaveOutlined /></template>
                    保存
                  </a-button>
                </a-form-item>
              </a-form>
            </div>

            <div v-if="activeType === 'WATERMARK'">
              <div class="panel-heading">
                <div>
                  <h3 class="panel-heading-title">水印设置</h3>
                  <div class="panel-heading-desc">配置页面水印内容和显示强度</div>
                </div>
              </div>
              <a-form :model="watermarkForm" :label-col="{ span: 7 }" :wrapper-col="{ span: 14 }">
                <a-form-item label="是否启用">
                  <a-switch v-model:checked="watermarkForm['watermark.enabled']" />
                </a-form-item>
                <a-form-item label="水印文本">
                  <a-input v-model:value="watermarkForm['watermark.text']" />
                </a-form-item>
                <a-form-item label="透明度">
                  <a-input-number v-model:value="watermarkForm['watermark.opacity']" :min="0.1" :max="1" :step="0.1" />
                </a-form-item>
                <a-form-item :wrapper-col="{ offset: 7 }">
                  <a-button type="primary" @click="handleSave('WATERMARK')">
                    <template #icon><SaveOutlined /></template>
                    保存
                  </a-button>
                </a-form-item>
              </a-form>
            </div>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { FileImageOutlined, LockOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons-vue'
import { getConfigByType, updateConfig } from '@/api/config'

const selectedKeys = ref(['PASSWORD'])
const activeType = ref('PASSWORD')
const passwordForm = ref({})
const accountForm = ref({})
const watermarkForm = ref({})

const loadConfig = async (configType) => {
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
  }
}

const parseValue = (value) => {
  if (value === 'true') return true
  if (value === 'false') return false
  if (!isNaN(value)) return Number(value)
  return value
}

const handleMenuSelect = ({ key }) => {
  activeType.value = key
  loadConfig(key)
}

const handleSave = async (configType) => {
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
  }
}

onMounted(() => {
  loadConfig('PASSWORD')
})
</script>

<style scoped>
.config-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 24px;
}

.config-nav {
  border-right: 1px solid var(--app-border);
  padding-right: 16px;
}

.settings-menu {
  border-inline-end: 0;
}

.config-content {
  max-width: 720px;
}

@media (max-width: 900px) {
  .config-layout {
    grid-template-columns: 1fr;
  }

  .config-nav {
    border-right: 0;
    padding-right: 0;
  }
}
</style>
