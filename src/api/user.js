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
