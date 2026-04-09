// src/api/system/system.js 系统相关API

import request from '@/utils/request'

// 登录
export function menuList() {
    return request.get('/menu')
}