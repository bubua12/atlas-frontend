import request from '@/utils/request'

export const listUser = params => request.get('/system/user', { params })
export const getUser = userId => request.get(`/system/user/${userId}`)
export const getUserRoles = userId => request.get(`/system/user/${userId}/roles`)
export const addUser = data => request.post('/system/user', data)
export const updateUser = data => request.put('/system/user', data)
export const deleteUser = userId => request.delete(`/system/user/${userId}`)
export const assignUserRoles = data => request.put('/system/user/roles', data)
export const getProfile = () => request.get('/system/user/profile')
export const updateProfile = data => request.put('/system/user/profile', data)
export const updateProfilePassword = data => request.put('/system/user/profile/password', data)
export const updateProfileAvatar = data => request.put('/system/user/profile/avatar', data)

/**
 * 导出用户列表（blob 下载）
 */
export const exportUser = params => request.get('/system/user/export', {
  params,
  responseType: 'blob'
})

/**
 * 导入用户（Excel 文件上传）
 */
export const importUser = file => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/system/user/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 下载用户导入模板
 */
export const downloadUserTemplate = () => request.get('/system/user/import/template', {
  responseType: 'blob'
})

/**
 * 获取当前用户的权限标识列表（用于按钮级权限控制）
 */
export const getPermissions = () => request.get('/system/user/permissions')
