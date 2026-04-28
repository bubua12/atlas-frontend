<template>
  <div class="page-shell profile-page">
    <div class="profile-layout">
      <a-card class="page-panel profile-summary" :bordered="false">
        <div class="summary-head">
          <a-upload :show-upload-list="false" :custom-request="handleAvatarUpload" accept="image/*">
            <button class="avatar-upload" type="button">
              <a-avatar :src="form.avatar" :size="96">{{ avatarText }}</a-avatar>
              <span class="avatar-mask"><CameraOutlined /> 更新头像</span>
            </button>
          </a-upload>
          <div class="summary-main">
            <h2>{{ form.nickname || form.username || '-' }}</h2>
            <div class="summary-username">@{{ form.username || '-' }}</div>
            <div class="summary-tags">
              <a-tag color="blue">{{ sexText }}</a-tag>
              <a-tag>{{ form.deptName || '暂无部门' }}</a-tag>
            </div>
          </div>
        </div>

        <div class="summary-section">
          <div class="summary-row">
            <span>手机号</span>
            <strong>{{ form.phone || '-' }}</strong>
          </div>
          <div class="summary-row">
            <span>邮箱</span>
            <strong>{{ form.email || '-' }}</strong>
          </div>
        </div>

        <div class="summary-section">
          <div class="summary-row">
            <span>登录名</span>
            <strong>{{ form.username || '-' }}</strong>
          </div>
          <div class="summary-row">
            <span>账号创建时间</span>
            <strong>{{ formatTime(form.createTime) }}</strong>
          </div>
        </div>
      </a-card>

      <a-card class="page-panel profile-editor" :bordered="false">
        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane key="info" tab="用户信息">
            <a-form :model="form" :label-col="{ style: { width: '88px' } }">
              <a-form-item label="姓名">
                <a-input v-model:value="form.nickname" placeholder="请输入姓名" />
              </a-form-item>
              <a-form-item label="手机号">
                <a-input v-model:value="form.phone" placeholder="请输入手机号" />
              </a-form-item>
              <a-form-item label="邮箱">
                <a-input v-model:value="form.email" placeholder="请输入邮箱" />
              </a-form-item>
              <a-form-item label="头像地址">
                <a-input v-model:value="form.avatar" placeholder="请输入头像 OSS 地址" />
              </a-form-item>
              <a-form-item label="性别">
                <a-radio-group v-model:value="form.sex">
                  <a-radio :value="1">男</a-radio>
                  <a-radio :value="2">女</a-radio>
                  <a-radio :value="0">未知</a-radio>
                </a-radio-group>
              </a-form-item>
              <div class="form-actions">
                <a-button type="primary" :loading="savingInfo" @click="saveProfile">
                  <template #icon><SaveOutlined /></template>
                  保存
                </a-button>
              </div>
            </a-form>
          </a-tab-pane>

          <a-tab-pane key="password" tab="修改密码">
            <a-form :model="passwordForm" :label-col="{ style: { width: '88px' } }">
              <a-form-item label="旧密码">
                <a-input-password v-model:value="passwordForm.oldPassword" placeholder="请输入旧密码" />
              </a-form-item>
              <a-form-item label="新密码">
                <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码，长度 6 ~ 30 个字符" />
              </a-form-item>
              <a-form-item label="确认密码">
                <a-input-password v-model:value="passwordForm.confirmPassword" placeholder="请再次输入新密码" />
              </a-form-item>
              <div class="form-actions">
                <a-button type="primary" :loading="savingPassword" @click="savePassword">
                  <template #icon><SaveOutlined /></template>
                  保存
                </a-button>
              </div>
            </a-form>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { CameraOutlined, SaveOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { getProfile, updateProfile, updateProfileAvatar, updateProfilePassword } from '@/api/user'
import { uploadFile } from '@/api/file'

const userStore = useUserStore()
const activeTab = ref('info')
const savingInfo = ref(false)
const savingPassword = ref(false)
const form = reactive({
  userId: null,
  username: '',
  nickname: '',
  email: '',
  phone: '',
  sex: 0,
  avatar: '',
  deptName: '',
  createTime: ''
})
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const avatarText = computed(() => (form.nickname || form.username || 'A').slice(0, 1).toUpperCase())
const sexText = computed(() => ({ 1: '男', 2: '女', 0: '未知' }[Number(form.sex)] || '未知'))

function applyProfile(data) {
  Object.assign(form, {
    userId: data.userId,
    username: data.username || '',
    nickname: data.nickname || '',
    email: data.email || '',
    phone: data.phone || '',
    sex: data.sex ?? 0,
    avatar: data.avatar || '',
    deptName: data.deptName || '',
    createTime: data.createTime || ''
  })
  userStore.setProfile(data)
}

async function loadProfile() {
  const data = await getProfile()
  applyProfile(data)
}

async function saveProfile() {
  savingInfo.value = true
  try {
    await updateProfile({
      nickname: form.nickname,
      email: form.email,
      phone: form.phone,
      sex: form.sex,
      avatar: form.avatar
    })
    message.success('保存成功')
    await loadProfile()
  } finally {
    savingInfo.value = false
  }
}

async function savePassword() {
  if (!passwordForm.oldPassword || !passwordForm.newPassword) {
    message.warning('请输入旧密码和新密码')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.warning('两次输入的新密码不一致')
    return
  }
  savingPassword.value = true
  try {
    await updateProfilePassword({ ...passwordForm })
    message.success('密码修改成功')
    Object.assign(passwordForm, { oldPassword: '', newPassword: '', confirmPassword: '' })
  } finally {
    savingPassword.value = false
  }
}

async function handleAvatarUpload({ file, onSuccess, onError }) {
  try {
    const avatar = await uploadFile(file)
    await updateProfileAvatar({ avatar })
    form.avatar = avatar
    const profile = await getProfile()
    applyProfile(profile)
    message.success('头像更新成功')
    onSuccess?.()
  } catch (error) {
    onError?.(error)
  }
}

function formatTime(value) {
  if (!value) return '-'
  return String(value).replace('T', ' ')
}

onMounted(loadProfile)
</script>

<style scoped>
.profile-layout {
  display: grid;
  grid-template-columns: minmax(320px, 0.72fr) minmax(480px, 1.35fr);
  gap: 16px;
}

.profile-summary :deep(.ant-card-body),
.profile-editor :deep(.ant-card-body) {
  padding: 20px;
}

.summary-head {
  display: flex;
  gap: 18px;
  align-items: center;
}

.avatar-upload {
  position: relative;
  display: block;
  width: 96px;
  height: 96px;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 8px;
  background: var(--app-bg-soft);
  cursor: pointer;
}

.avatar-mask {
  position: absolute;
  inset: auto 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 30px;
  color: #fff;
  background: rgba(15, 23, 42, 0.68);
  font-size: 12px;
}

.summary-main {
  min-width: 0;
}

.summary-main h2 {
  margin: 0;
  color: var(--app-text);
  font-size: 22px;
  font-weight: 700;
}

.summary-username {
  margin-top: 6px;
  color: var(--app-text-muted);
  font-size: 13px;
}

.summary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.summary-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--app-border);
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 32px;
  color: var(--app-text-secondary);
}

.summary-row span {
  color: var(--app-text-muted);
}

.summary-row strong {
  min-width: 0;
  font-weight: 600;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-editor {
  min-height: 360px;
}

.profile-editor :deep(.ant-tabs-nav) {
  margin-bottom: 18px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}

.form-actions .ant-btn {
  min-width: 150px;
}

:global(html.dark) .avatar-upload {
  background: #141820;
}

@media (max-width: 980px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .summary-head {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
