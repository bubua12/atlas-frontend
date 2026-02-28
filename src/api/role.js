import request from '@/utils/request'

export const listRole = params => request.get('/system/role', { params })
export const getRole = roleId => request.get(`/system/role/${roleId}`)
export const addRole = data => request.post('/system/role', data)
export const updateRole = data => request.put('/system/role', data)
export const deleteRole = roleId => request.delete(`/system/role/${roleId}`)
