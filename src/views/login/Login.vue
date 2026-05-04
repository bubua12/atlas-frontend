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
        <a-card class="login-card" :bordered="false">
          <div class="login-heading">
            <div class="login-title">登录控制台</div>
            <div class="login-subtitle">请选择登录方式继续</div>
          </div>
          <a-tabs class="login-tabs" v-model:activeKey="loginType" @change="onTabChange">
            <a-tab-pane key="password" tab="账号密码" />
            <a-tab-pane key="captcha" tab="短信验证" />
            <a-tab-pane key="wechat" tab="企业微信" />
          </a-tabs>
          <div class="login-content">
            <a-form class="login-form" :model="form" :rules="currentRules" ref="formRef">
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
                <a-spin v-if="qrLoading" class="qr-loading" />
              </template>
              <a-form-item v-if="loginType !== 'wechat'" class="login-action">
                <a-button type="primary" block size="large" :loading="loading" @click="handleLogin">登 录</a-button>
              </a-form-item>
            </a-form>
            <div class="other-login" v-if="loginType !== 'wechat'">
              <a-divider plain>其他登录方式</a-divider>
              <div class="login-icons">
                <WeiboCircleOutlined class="login-icon" title="微博登录" @click="handleWeiboLogin" />
              </div>
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
import { sendSms, getWecomConfig } from '@/api/auth'
import {
  UserOutlined, LockOutlined, MobileOutlined,
  SafetyOutlined, WeiboCircleOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
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
.login-container,
.login-container * {
  box-sizing: border-box;
}

.login-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
  color-scheme: only light;
  min-height: 100vh;
  padding: clamp(22px, 4vw, 64px);
  overflow: hidden;
  background:
    linear-gradient(120deg, rgba(31, 79, 191, 0.12), transparent 38%),
    linear-gradient(150deg, #f8fbff 0%, #eef4fb 46%, #f6fbf1 100%);
}

.login-container::before {
  position: absolute;
  inset: 0;
  z-index: 0;
  content: "";
  pointer-events: none;
  opacity: 0.74;
  background-image:
    linear-gradient(rgba(31, 79, 191, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(31, 79, 191, 0.055) 1px, transparent 1px);
  background-size: 36px 36px;
}

.login-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(430px, 24vw, 500px);
  gap: clamp(48px, 8vw, 140px);
  align-items: center;
  width: min(1760px, 100%);
  min-height: min(760px, calc(100vh - 64px));
}

.login-brand-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: stretch;
  min-height: 520px;
  padding: 24px clamp(24px, 4vw, 64px) 24px 8px;
  overflow: hidden;
  color: var(--app-text);
  background: transparent;
}

.login-brand-panel::after {
  position: absolute;
  right: 0;
  bottom: 34px;
  left: 8px;
  height: 160px;
  content: "";
  border: 1px solid rgba(31, 79, 191, 0.1);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(31, 79, 191, 0.12), rgba(82, 196, 26, 0.08)),
    linear-gradient(90deg, rgba(255, 255, 255, 0.42), rgba(255, 255, 255, 0));
  transform: skewY(-4deg);
  transform-origin: left center;
}

.brand-block {
  position: absolute;
  top: 4px;
  left: 8px;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid rgba(31, 79, 191, 0.2);
  border-radius: 8px;
  color: #fff;
  background: #1f4fbf;
  font-size: 18px;
  font-weight: 800;
  box-shadow: 0 12px 30px rgba(31, 79, 191, 0.2);
}

.brand-name {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.1;
}

.brand-subtitle {
  margin-top: 3px;
  color: var(--app-text-muted);
  font-size: 12px;
}

.brand-copy {
  position: relative;
  z-index: 1;
  max-width: 560px;
}

.brand-copy::before {
  display: block;
  width: 44px;
  height: 4px;
  margin-bottom: 22px;
  border-radius: 4px;
  background: #1f4fbf;
  content: "";
}

.brand-copy h1 {
  margin: 0;
  color: #14213d;
  font-size: clamp(38px, 4.3vw, 56px);
  font-weight: 750;
  letter-spacing: 0;
  line-height: 1.08;
}

.brand-copy p {
  max-width: 430px;
  margin: 18px 0 0;
  color: var(--app-text-secondary);
  font-size: 15px;
  line-height: 1.8;
}

.brand-metrics {
  display: none;
}

.login-form-panel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  align-self: stretch;
  padding: 0;
  background: transparent;
}

.login-card.ant-card {
  width: 100%;
  height: clamp(528px, 58vh, 592px);
  min-height: 528px;
  padding: 0;
  border: 1px solid rgba(31, 79, 191, 0.12);
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.16);
}

.login-card :deep(.ant-card-body) {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 528px;
  padding: 34px 32px 28px;
  box-sizing: border-box;
}

.login-heading {
  margin-bottom: 22px;
}

.login-title {
  color: var(--app-text);
  font-size: 24px;
  font-weight: 700;
  line-height: 1.25;
  text-align: left;
}

.login-subtitle {
  margin-top: 6px;
  color: var(--app-text-muted);
  font-size: 13px;
}

.login-card :deep(.ant-tabs-nav) {
  margin-bottom: 22px;
}

.login-card :deep(.ant-tabs-nav::before) {
  border-bottom-color: var(--app-border);
}

.login-card :deep(.ant-tabs-nav-list) {
  width: 100%;
}

.login-card :deep(.ant-tabs-tab) {
  flex: 1;
  justify-content: center;
  margin: 0;
  padding: 11px 0;
  font-size: 14px;
}

.login-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.login-form {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.login-form :deep(.ant-form-item) {
  margin-bottom: 16px;
}

.login-card :deep(.ant-input),
.login-card :deep(.ant-input-affix-wrapper) {
  min-height: 46px;
  border-radius: 6px;
}

.login-card :deep(.ant-btn) {
  border-radius: 6px;
}

.login-card :deep(.ant-btn-lg) {
  height: 46px;
}

.login-action.ant-form-item {
  margin-top: auto;
  margin-bottom: 0;
}

.captcha-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 118px;
  gap: 10px;
}

.captcha-row :deep(.ant-btn) {
  height: 46px;
  padding-inline: 12px;
  font-size: 13px;
  white-space: nowrap;
}

.wecom-qr-container {
  position: relative;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 0;
  overflow: hidden;
}

.wecom-qr-container :deep(iframe) {
  position: absolute;
  top: 0;
  left: 50%;
  width: 320px !important;
  height: 404px !important;
  max-width: 100%;
  border: none;
  transform: translateX(-50%) scale(0.84);
  transform-origin: top center;
}

.qr-loading {
  display: block;
  margin: 14px auto 0;
  text-align: center;
}

.other-login {
  margin-top: 18px;
}

.other-login :deep(.ant-divider) {
  margin: 0;
  color: var(--app-text-muted);
  font-size: 12px;
}

.login-icons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 14px;
}

.login-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--app-border);
  border-radius: 50%;
  color: var(--app-text-muted);
  background: var(--app-panel);
  font-size: 21px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.login-icon:hover {
  border-color: rgba(31, 79, 191, 0.32);
  color: #1f4fbf;
  box-shadow: 0 8px 24px rgba(31, 79, 191, 0.14);
}

@media (max-width: 960px) {
  .login-container {
    align-items: flex-start;
    padding: 22px 18px 32px;
  }

  .login-shell {
    grid-template-columns: 1fr;
    gap: 28px;
    min-height: auto;
  }

  .login-brand-panel {
    min-height: auto;
    padding: 18px 0 0;
  }

  .login-brand-panel::after {
    right: 0;
    bottom: 0;
    left: 0;
    height: 92px;
  }

  .brand-block {
    position: static;
    margin-bottom: 42px;
  }

  .brand-copy h1 {
    font-size: 34px;
  }

  .login-form-panel {
    justify-content: center;
    min-height: auto;
  }
}

@media (max-width: 560px) {
  .login-container {
    padding: 18px 14px 28px;
  }

  .login-shell {
    gap: 22px;
  }

  .brand-block {
    margin-bottom: 26px;
  }

  .brand-copy::before {
    margin-bottom: 16px;
  }

  .brand-copy h1 {
    font-size: 30px;
  }

  .brand-copy p {
    margin-top: 12px;
    font-size: 13px;
  }

  .login-card.ant-card {
    width: 100%;
    height: 512px;
    min-height: 512px;
  }

  .login-card :deep(.ant-card-body) {
    height: 100%;
    min-height: 512px;
    padding: 24px 20px;
  }

  .wecom-qr-container :deep(iframe) {
    transform: translateX(-50%) scale(0.74);
  }

  .captcha-row {
    grid-template-columns: 1fr;
  }

  .captcha-row :deep(.ant-btn) {
    width: 100%;
  }
}
</style>
