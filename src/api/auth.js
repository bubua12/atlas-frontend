import request from '@/utils/request'

/** 统一登录（通过 grantType 区分登录方式） */
export const login = data => request.post('/auth/login', data)
export const logout = () => request.post('/auth/logout')
export const refreshToken = () => request.post('/auth/refresh')

/** 发送短信验证码 */
export const sendSms = phone => request.get('/auth/captcha/sms', { params: { phone } })

/** 获取企业微信扫码登录配置 */
export const getWecomConfig = () => request.get('/auth/wecom/config')
