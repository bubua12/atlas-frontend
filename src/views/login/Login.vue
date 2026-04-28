<template>
  <div class="login-container">
    <div class="login-shell">
      <section class="login-brand-panel">
        <div class="brand-block">
          <div class="brand-mark">A</div>
          <div>
            <div class="brand-name">Atlas</div>
            <div class="brand-subtitle">Enterprise Platform</div>
          </div>
        </div>
        <div class="brand-copy">
          <h1>Atlas 管理系统</h1>
          <p>统一认证、权限、系统配置与运行监控入口</p>
        </div>
        <div class="brand-metrics">
<!--          <div>-->
<!--            <span>Gateway</span>-->
<!--            <strong>8080</strong>-->
<!--          </div>-->
<!--          <div>-->
<!--            <span>Auth</span>-->
<!--            <strong>9100</strong>-->
<!--          </div>-->
<!--          <div>-->
<!--            <span>System</span>-->
<!--            <strong>9200</strong>-->
<!--          </div>-->
        </div>
      </section>

      <section class="login-form-panel">
        <a-button class="theme-toggle" shape="circle" @click="themeStore.toggle()">
          <template #icon>
            <BulbOutlined v-if="!themeStore.isDark" />
            <BulbFilled v-else />
          </template>
        </a-button>
        <a-card class="login-card" :bordered="false">
          <div class="login-heading">
            <div class="login-title">登录控制台</div>
            <div class="login-subtitle">请选择登录方式继续</div>
          </div>
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
            <div class="captcha-row">
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
          <a-button type="primary" block size="large" :loading="loading" @click="handleLogin">登 录</a-button>
        </a-form-item>
      </a-form>
      <div class="other-login" v-if="loginType !== 'wechat'">
        <a-divider plain>其他登录方式</a-divider>
        <div class="login-icons">
           <WeiboCircleOutlined class="login-icon" @click="handleWeiboLogin" />
        </div>
      </div>
        </a-card>
      </section>
    </div>
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
  top: 24px;
  right: 24px;
  z-index: 2;
}

.login-container {
  min-height: 100vh;
  padding: 32px;
  background:
    linear-gradient(135deg, rgba(22, 119, 255, 0.12), transparent 36%),
    linear-gradient(315deg, rgba(82, 196, 26, 0.08), transparent 32%),
    var(--app-bg);
}

.login-shell {
  display: grid;
  grid-template-columns: minmax(360px, 0.95fr) minmax(420px, 1fr);
  min-height: calc(100vh - 64px);
  overflow: hidden;
  border: 1px solid var(--app-border);
  border-radius: 12px;
  background: var(--app-panel);
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.14);
}

.login-brand-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 42px;
  overflow: hidden;
  color: #fff;
  background:
    linear-gradient(rgba(255, 255, 255, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.055) 1px, transparent 1px),
    linear-gradient(135deg, #12213a, #183b6e 52%, #0f5f73);
  background-size: 28px 28px, 28px 28px, auto;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 18px;
  font-weight: 800;
}

.brand-name {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.1;
}

.brand-subtitle {
  margin-top: 3px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 12px;
}

.brand-copy h1 {
  margin: 0;
  font-size: 38px;
  font-weight: 750;
  letter-spacing: 0;
}

.brand-copy p {
  max-width: 360px;
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 15px;
  line-height: 1.8;
}

.brand-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.brand-metrics div {
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
}

.brand-metrics span {
  display: block;
  color: rgba(255, 255, 255, 0.56);
  font-size: 12px;
}

.brand-metrics strong {
  display: block;
  margin-top: 6px;
  color: #fff;
  font-size: 18px;
}

.login-form-panel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 42px;
  background: var(--app-panel);
}

.login-card.ant-card {
  width: min(430px, 100%);
  background: transparent;
  box-shadow: none;
}

.login-card :deep(.ant-card-body) {
  padding: 0;
}

.login-heading {
  margin-bottom: 24px;
}

.login-title {
  color: var(--app-text);
  font-size: 24px;
  font-weight: 700;
}

.login-subtitle {
  margin-top: 6px;
  color: var(--app-text-muted);
  font-size: 13px;
}

.login-card :deep(.ant-tabs-nav) {
  margin-bottom: 22px;
}

.login-card :deep(.ant-input),
.login-card :deep(.ant-input-affix-wrapper) {
  min-height: 42px;
}

.captcha-row {
  display: flex;
  gap: 8px;
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
  color: #4f8cff;
}

:global(html.dark) .login-container {
  background:
    linear-gradient(135deg, rgba(79, 140, 255, 0.14), transparent 36%),
    linear-gradient(315deg, rgba(99, 214, 133, 0.08), transparent 32%),
    var(--app-bg);
}

:global(html.dark) .login-shell {
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.36);
}

:global(html.dark) .login-brand-panel {
  background:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(135deg, #0d1422, #10274c 52%, #0d3b49);
  background-size: 28px 28px, 28px 28px, auto;
}

@media (max-width: 900px) {
  .login-container {
    padding: 16px;
  }

  .login-shell {
    grid-template-columns: 1fr;
  }

  .login-brand-panel {
    min-height: 280px;
    padding: 28px;
  }

  .brand-copy h1 {
    font-size: 30px;
  }

  .login-form-panel {
    padding: 28px;
  }
}

@media (max-width: 560px) {
  .brand-metrics {
    grid-template-columns: 1fr;
  }

  .captcha-row {
    flex-direction: column;
  }
}
</style>
