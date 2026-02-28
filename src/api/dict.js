import request from '@/utils/request'

export const listDictType = params => request.get('/system/dict/type', { params })
export const getDictType = dictId => request.get(`/system/dict/type/${dictId}`)
export const addDictType = data => request.post('/system/dict/type', data)
export const updateDictType = data => request.put('/system/dict/type', data)
export const deleteDictType = dictId => request.delete(`/system/dict/type/${dictId}`)

export const listDictData = dictType => request.get(`/system/dict/data/${dictType}`)
export const getDictData = dictType => request.get(`/system/dict/data/${dictType}`)
export const addDictData = data => request.post('/system/dict/data', data)
export const updateDictData = data => request.put('/system/dict/data', data)
export const deleteDictData = dictCode => request.delete(`/system/dict/data/${dictCode}`)
