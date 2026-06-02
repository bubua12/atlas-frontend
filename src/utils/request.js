import axios from 'axios'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import router from '@/router'

// 401 去重：并发请求同时过期时只跳一次登录页
let isRedirectingToLogin = false

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token && !isPublicAuthRequest(config.url)) config.headers.Authorization = token
  return config
})

function isPublicAuthRequest(url = '') {
  return [
    '/auth/login',
    '/auth/captcha',
    '/auth/register',
    '/auth/wecom/config'
  ].some(path => url.startsWith(path))
}

request.interceptors.response.use(
  res => {
    // blob 响应（文件下载）直接透传，不走 JSON 解析
    if (res.config.responseType === 'blob') return res
    const { code, msg, data } = res.data
    if (code === 200) return data
    message.error(msg || '请求失败')
    return Promise.reject(new Error(msg))
  },
  async err => {
    // blob 请求失败时，服务器可能返回 JSON 错误信息而不是文件
    if (err.response?.config?.responseType === 'blob' && err.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text()
        const json = JSON.parse(text)
        if (json.msg) {
          message.error(json.msg)
          return Promise.reject(new Error(json.msg))
        }
      } catch { /* 非 JSON blob，走兜底逻辑 */ }
    }
    if (err.response?.status === 401) {
      if (!isRedirectingToLogin) {
        isRedirectingToLogin = true
        const userStore = useUserStore()
        userStore.logout()
        router.push('/login')
        message.error('登录已过期，请重新登录')
        setTimeout(() => { isRedirectingToLogin = false }, 1000)
      }
      return Promise.reject(err)
    }
    // 403 权限不足：静默处理，不弹错误提示，由调用方自行决定展示逻辑
    if (err.response?.status === 403) {
      return Promise.reject(err)
    }
    message.error(err.message || '网络错误')
    return Promise.reject(err)
  }
)

export default request
