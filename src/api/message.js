import request from '@/utils/request'

// ========== 管理员接口 ==========

/** 公告列表 */
export const listAnnounces = (params) =>
    request.get('/message/announce', { params })

/** 创建公告 */
export const createAnnounce = (data) =>
    request.post('/message/announce', data)

/** 更新公告 */
export const updateAnnounce = (data) =>
    request.put('/message/announce', data)

/** 撤回公告 */
export const revokeAnnounce = (messageId) =>
    request.put(`/message/announce/${messageId}/revoke`)

/** 删除公告 */
export const deleteAnnounce = (messageId) =>
    request.delete(`/message/announce/${messageId}`)

// ========== 用户接口 ==========

/** 我的消息列表 */
export const listMyMessages = (params) =>
    request.get('/message/my', { params })

/** 未读数量 */
export const getUnreadCount = () =>
    request.get('/message/my/unread-count')

/** 标记已读 */
export const markRead = (messageId) =>
    request.put(`/message/my/${messageId}/read`)

/** 全部已读 */
export const markAllRead = () =>
    request.put('/message/my/read-all')

/** 用户侧删除 */
export const deleteMessage = (messageId) =>
    request.delete(`/message/my/${messageId}`)

/** 批量已读 */
export const batchMarkRead = (messageIds) =>
    request.put('/message/my/batch-read', messageIds)

/** 批量删除 */
export const batchDeleteMessages = (messageIds) =>
    request.delete('/message/my/batch', { data: messageIds })
