// src/api/system/system.js 系统相关API

import request from '@/utils/request'

// 获取菜单列表
export function menuList() {
    return request.get('/system/menu')
}