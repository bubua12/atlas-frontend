import request from '@/utils/request'

export const getConfigByType = configType => request.get(`/system/config/type/${configType}`)
export const updateConfig = data => request.put('/system/config', data)
