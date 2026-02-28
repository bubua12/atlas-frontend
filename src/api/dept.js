import request from '@/utils/request'

export const listDept = params => request.get('/system/dept', { params })
export const getDept = deptId => request.get(`/system/dept/${deptId}`)
export const addDept = data => request.post('/system/dept', data)
export const updateDept = data => request.put('/system/dept', data)
export const deleteDept = deptId => request.delete(`/system/dept/${deptId}`)
