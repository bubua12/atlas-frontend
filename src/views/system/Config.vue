<template>
  <div>
    <a-card :bordered="false">
      <a-row :gutter="24">
        <a-col :span="5">
          <a-menu v-model:selectedKeys="selectedKeys" mode="inline" @select="handleMenuSelect">
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
        </a-col>

        <a-col :span="19">
          <div style="padding-left: 24px">
            <div v-if="activeType === 'PASSWORD'">
              <h3 style="margin-bottom: 24px">密码设置</h3>
              <a-form :model="passwordForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
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
                <a-form-item :wrapper-col="{ offset: 6 }">
                  <a-button type="primary" @click="handleSave('PASSWORD')">保存</a-button>
                </a-form-item>
              </a-form>
            </div>

            <div v-if="activeType === 'ACCOUNT'">
              <h3 style="margin-bottom: 24px">账号设置</h3>
              <a-form :model="accountForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
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
                <a-form-item :wrapper-col="{ offset: 6 }">
                  <a-button type="primary" @click="handleSave('ACCOUNT')">保存</a-button>
                </a-form-item>
              </a-form>
            </div>

            <div v-if="activeType === 'WATERMARK'">
              <h3 style="margin-bottom: 24px">水印设置</h3>
              <a-form :model="watermarkForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
                <a-form-item label="是否启用">
                  <a-switch v-model:checked="watermarkForm['watermark.enabled']" />
                </a-form-item>
                <a-form-item label="水印文本">
                  <a-input v-model:value="watermarkForm['watermark.text']" />
                </a-form-item>
                <a-form-item label="透明度">
                  <a-input-number v-model:value="watermarkForm['watermark.opacity']" :min="0.1" :max="1" :step="0.1" />
                </a-form-item>
                <a-form-item :wrapper-col="{ offset: 6 }">
                  <a-button type="primary" @click="handleSave('WATERMARK')">保存</a-button>
                </a-form-item>
              </a-form>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { LockOutlined, UserOutlined, FileImageOutlined } from '@ant-design/icons-vue'
import { getConfigByType, updateConfig } from '@/api/config'

const selectedKeys = ref(['PASSWORD'])
const activeType = ref('PASSWORD')
const passwordForm = ref({})
const accountForm = ref({})
const watermarkForm = ref({})

const loadConfig = async (configType) => {
  try {
    const res = await getConfigByType(configType)
    if (res.code === 200) {
      const formData = {}
      res.data.forEach(item => {
        formData[item.configKey] = parseValue(item.configValue)
      })

      if (configType === 'PASSWORD') {
        passwordForm.value = formData
      } else if (configType === 'ACCOUNT') {
        accountForm.value = formData
      } else if (configType === 'WATERMARK') {
        watermarkForm.value = formData
      }
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
