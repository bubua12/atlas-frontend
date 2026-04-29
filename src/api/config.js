import request from '@/utils/request'

// 系统设置页按类型加载配置项，例如 PASSWORD、ACCOUNT、WATERMARK。
export const getConfigByType = configType => request.get(`/system/config/type/${configType}`)
// 登录后全局水印读取运行时配置，不依赖系统设置管理权限。
export const getWatermarkConfig = () => request.get('/system/config/watermark')
// 保留单项更新入口，批量保存是系统设置页的主要使用方式。
export const updateConfig = data => request.put('/system/config', data)
// 系统设置页保存一组配置时使用，后端会逐项校验 key/type/value。
export const updateConfigs = data => request.put('/system/config/batch', data)
