import request from '@/utils/request'

export const uploadFile = file => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/infra/file/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 上传头像文件（按模块归档到 avatar/ 目录下）
 */
export const uploadAvatarFile = file => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/infra/file/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
