import request from '@/utils/request'

export const listMenu = params => request.get('/system/menu', { params })
export const getMenu = menuId => request.get(`/system/menu/${menuId}`)
export const addMenu = data => request.post('/system/menu', data)
export const updateMenu = data => request.put('/system/menu', data)
export const deleteMenu = menuId => request.delete(`/system/menu/${menuId}`)
