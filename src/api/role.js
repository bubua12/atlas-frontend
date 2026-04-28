import request from '@/utils/request'

export const listRole = params => request.get('/system/role', { params })
export const getRole = roleId => request.get(`/system/role/${roleId}`)
export const getRoleMenus = roleId => request.get(`/system/role/${roleId}/menus`)
export const getRoleDepts = roleId => request.get(`/system/role/${roleId}/depts`)
export const addRole = data => request.post('/system/role', data)
export const updateRole = data => request.put('/system/role', data)
export const deleteRole = roleId => request.delete(`/system/role/${roleId}`)
export const bindRoleMenus = data => request.put('/system/role/menus', data)
export const updateRoleDataScope = data => request.put('/system/role/data-scope', data)
export const getRoleUsers = roleId => request.get(`/system/role/${roleId}/users`)
export const assignRoleUsers = data => request.put('/system/role/users', data)
