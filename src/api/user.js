import request from '@/utils/request'

export const listUser = params => request.get('/system/user', { params })
export const getUser = userId => request.get(`/system/user/${userId}`)
export const addUser = data => request.post('/system/user', data)
export const updateUser = data => request.put('/system/user', data)
export const deleteUser = userId => request.delete(`/system/user/${userId}`)
