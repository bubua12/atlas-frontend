<template>
  <div class="navbar">
    <span>{{ route.meta.title }}</span>
    <el-dropdown @command="handleCommand">
      <span style="cursor:pointer;display:flex;align-items:center">
        <el-icon style="margin-right:4px"><UserFilled /></el-icon>
        {{ userStore.username }}
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { logout } from '@/api/auth'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

function handleCommand(cmd) {
  if (cmd === 'logout') {
    logout().finally(() => {
      userStore.logout()
      router.push('/login')
    })
  }
}
</script>
