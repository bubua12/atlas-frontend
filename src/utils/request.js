import axios from 'axios'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import router from '@/router'

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
    const { code, msg, data } = res.data
    if (code === 200) return data
    message.error(msg || '请求失败')
    return Promise.reject(new Error(msg))
  },
  err => {
    if (err.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      router.push('/login')
    }
    message.error(err.message || '网络错误')
    return Promise.reject(err)
  }
)

export default request
