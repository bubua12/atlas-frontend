<template>
  <div class="login-container">
    <span class="theme-toggle" @click="themeStore.toggle()">
      <BulbOutlined v-if="!themeStore.isDark" />
      <BulbFilled v-else />
    </span>
    <a-card class="login-card">
      <div class="login-title">Atlas 管理系统</div>
      <a-tabs v-model:activeKey="loginType" @change="onTabChange">
        <a-tab-pane key="password" tab="账号密码" />
        <a-tab-pane key="captcha" tab="短信验证码" />
        <a-tab-pane key="wechat" tab="企业微信登录" />
      </a-tabs>
      <a-form :model="form" :rules="currentRules" ref="formRef">
        <template v-if="loginType === 'password'">
          <a-form-item name="username">
            <a-input v-model:value="form.username" placeholder="用户名">
              <template #prefix><UserOutlined /></template>
            </a-input>
          </a-form-item>
          <a-form-item name="password">
            <a-input-password v-model:value="form.password" placeholder="密码" @pressEnter="handleLogin">
              <template #prefix><LockOutlined /></template>
            </a-input-password>
          </a-form-item>
        </template>
        <template v-if="loginType === 'captcha'">
          <a-form-item name="phone">
            <a-input v-model:value="form.phone" placeholder="手机号">
              <template #prefix><MobileOutlined /></template>
            </a-input>
          </a-form-item>
          <a-form-item name="captchaCode">
            <div style="display:flex;gap:8px">
              <a-input v-model:value="form.captchaCode" placeholder="验证码" @pressEnter="handleLogin">
                <template #prefix><SafetyOutlined /></template>
              </a-input>
              <a-button :disabled="countdown > 0" @click="handleSendSms">
                {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
              </a-button>
            </div>
          </a-form-item>
        </template>
        <template v-if="loginType === 'wechat'">
          <div id="wecom-qr" class="wecom-qr-container" />
          <a-spin v-if="qrLoading" style="display:block;text-align:center;margin:20px 0" />
        </template>
        <a-form-item v-if="loginType !== 'wechat'">
          <a-button type="primary" block :loading="loading" @click="handleLogin">登 录</a-button>
        </a-form-item>
      </a-form>
      <div class="other-login" v-if="loginType !== 'wechat'">
        <a-divider plain>其他登录方式</a-divider>
        <div class="login-icons">
           <WeiboCircleOutlined class="login-icon" @click="handleWeiboLogin" />
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { sendSms, getWecomConfig } from '@/api/auth'
import {
  UserOutlined, LockOutlined, MobileOutlined,
  SafetyOutlined, BulbOutlined, BulbFilled,
  WeiboCircleOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const themeStore = useThemeStore()
const formRef = ref()
const loading = ref(false)
const qrLoading = ref(false)
const loginType = ref('password')
const countdown = ref(0)
let timer = null

const form = reactive({
  username: '', password: '',
  phone: '', captchaCode: '', captchaKey: '',
  wxCode: ''
})

const rulesMap = {
  password: {
    username: [{ required: true, message: '请输入用户名' }],
    password: [{ required: true, message: '请输入密码' }]
  },
  captcha: {
    phone: [{ required: true, message: '请输入手机号' }, { pattern: /^1\d{10}$/, message: '手机号格式不正确' }],
    captchaCode: [{ required: true, message: '请输入验证码' }]
  }
}

const currentRules = computed(() => rulesMap[loginType.value])

function onTabChange() {
  Object.assign(form, { username: '', password: '', phone: '', captchaCode: '', captchaKey: '', wxCode: '' })
  formRef.value?.clearValidate()
}

async function handleSendSms() {
  await formRef.value.validateFields(['phone'])
  const data = await sendSms(form.phone)
  form.captchaKey = data.captchaKey || ''
  message.success('验证码已发送')
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(timer)
  }, 1000)
}

async function handleLogin() {
  await formRef.value.validate()
  loading.value = true
  try {
    const payloadMap = {
      password: { grantType: 'password', username: form.username, password: form.password },
      captcha: { grantType: 'captcha', phone: form.phone, captchaCode: form.captchaCode, captchaKey: form.captchaKey }
    }
    await userStore.login(payloadMap[loginType.value])
    router.push('/')
  } finally {
    loading.value = false
  }
}

function handleWeiboLogin() {
  window.location.href = 'https://api.weibo.com/oauth2/authorize?client_id=4079653655&response_type=code&redirect_uri=https://atlas.bubua12.com/auth/success'
}

/** 企业微信 code 登录 */
async function loginByWecomCode(code) {
  loading.value = true
  try {
    await userStore.login({ grantType: 'wechat', wxCode: code })
    router.push('/')
  } catch {
    message.error('企业微信登录失败，请重试')
  } finally {
    loading.value = false
  }
}

/** 加载企业微信扫码 SDK 并渲染二维码 */
let sdkLoaded = false
function loadWecomSdk() {
  return new Promise((resolve, reject) => {
    if (sdkLoaded) return resolve()
    const script = document.createElement('script')
    script.src = 'https://wwcdn.weixin.qq.com/node/wework/wwopen/js/wwLogin-1.2.7.js'
    script.onload = () => { sdkLoaded = true; resolve() }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

async function renderQrCode() {
  qrLoading.value = true
  try {
    const config = await getWecomConfig()
    await loadWecomSdk()
    await nextTick()
    const el = document.getElementById('wecom-qr')
    if (!el) return
    el.innerHTML = ''
    new window.WwLogin({
      id: 'wecom-qr',
      appid: config.corpId,
      agentid: config.agentId,
      redirect_uri: encodeURIComponent(config.redirectUri),
      state: 'atlas',
      lang: 'zh'
    })
  } catch {
    message.error('加载企业微信二维码失败')
  } finally {
    qrLoading.value = false
  }
}

// 切换到企业微信 tab 时渲染二维码
watch(loginType, (val) => {
  if (val === 'wechat') nextTick(renderQrCode)
})

// 页面加载时检测 URL 中的企业微信回调 code
onMounted(() => {
  const code = route.query.code
  if (code) {
    loginByWecomCode(code)
  }
})
</script>

<style scoped>
.theme-toggle {
  position: absolute;
  top: 20px;
  right: 24px;
  font-size: 20px;
  color: rgba(255, 255, 255, 0.75);
  cursor: pointer;
}
.theme-toggle:hover {
  color: #fff;
}
.wecom-qr-container {
  display: flex;
  justify-content: center;
  min-height: 300px;
}
.wecom-qr-container iframe {
  border: none;
}
.other-login {
  margin-top: 24px;
}
.login-icons {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 12px;
}
.login-icon {
  font-size: 24px;
  color: #888;
  cursor: pointer;
  transition: color 0.3s;
}
.login-icon:hover {
  color: #faad14;
}
</style>
