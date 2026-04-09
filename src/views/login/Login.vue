<script setup>
import {reactive, ref} from "vue";
import {ElMessage} from "element-plus";
import router from "@/router/router.js";

const loading = ref(false);
const loginFormRef = ref();
const loginForm = reactive({
  username: "",
  password: "",
  remember: true
});

const formRules = {
  username: [
    {required: true, message: "请输入账号", trigger: "blur"},
    {min: 3, max: 20, message: "账号长度需要在 3-20 个字符之间", trigger: "blur"}
  ],
  password: [
    {required: true, message: "请输入密码", trigger: "blur"},
    {min: 6, max: 20, message: "密码长度需要在 6-20 个字符之间", trigger: "blur"}
  ]
};

const handleLogin = async () => {
  if (!loginFormRef.value) {
    return;
  }

  const valid = await loginFormRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }

  loading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 600));

    if (loginForm.remember) {
      localStorage.setItem("lastUsername", loginForm.username);
    } else {
      localStorage.removeItem("lastUsername");
    }

    ElMessage.success("登录成功");
    await router.push("/home");
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  loginFormRef.value?.resetFields();
};

const lastUsername = localStorage.getItem("lastUsername");
if (lastUsername) {
  loginForm.username = lastUsername;
}
</script>

<template>
  <div class="login-page">
    <div class="login-panel">
      <div class="login-title">欢迎登录 Atlas 系统</div>
      <div class="login-sub-title">请输入账号与密码继续访问</div>

      <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="formRules"
          label-position="top"
          size="large"
          @keyup.enter="handleLogin"
      >
        <el-form-item label="账号" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入账号"/>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              show-password
              placeholder="请输入密码"
          />
        </el-form-item>

        <div class="login-options">
          <el-checkbox v-model="loginForm.remember">记住账号</el-checkbox>
          <el-link type="primary" :underline="false">忘记密码</el-link>
        </div>

        <div class="login-actions">
          <el-button plain @click="resetForm">重置</el-button>
          <el-button type="primary" :loading="loading" @click="handleLogin">
            登录
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: calc(100vh - 96px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #f7f9fc 0%, #eef3ff 100%);
}

.login-panel {
  width: 420px;
  max-width: 100%;
  background: #fff;
  border-radius: 14px;
  padding: 28px 24px;
  box-shadow: 0 10px 28px rgba(26, 68, 152, 0.12);
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2d3d;
}

.login-sub-title {
  margin-top: 6px;
  margin-bottom: 22px;
  color: #8a94a6;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.login-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
