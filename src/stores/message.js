import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notification } from 'ant-design-vue'
import { getUnreadCount } from '@/api/message'

export const useMessageStore = defineStore('message', () => {
    const unreadCount = ref({ total: 0, announcement: 0, system: 0, alert: 0 })
    const ws = ref(null)
    const reconnectAttempts = ref(0)
    let reconnectTimer = null
    let heartbeatTimer = null

    const badgeCount = computed(() => {
        const total = unreadCount.value.total
        return total > 99 ? '99+' : total
    })

    function connect() {
        const token = localStorage.getItem('token')
        if (!token || ws.value) return

        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${protocol}//${location.host}/api/ws/message?token=${token}`

        try {
            ws.value = new WebSocket(wsUrl)
        } catch (e) {
            scheduleReconnect()
            return
        }

        ws.value.onopen = () => {
            reconnectAttempts.value = 0
            startHeartbeat()
        }

        ws.value.onmessage = (event) => {
            if (event.data === 'PONG') return
            try {
                const msg = JSON.parse(event.data)
                handleWsMessage(msg)
            } catch (e) {
                // ignore non-JSON messages
            }
        }

        ws.value.onclose = () => {
            ws.value = null
            stopHeartbeat()
            scheduleReconnect()
        }

        ws.value.onerror = () => {
            ws.value?.close()
        }
    }

    function startHeartbeat() {
        stopHeartbeat()
        heartbeatTimer = setInterval(() => {
            if (ws.value?.readyState === WebSocket.OPEN) {
                ws.value.send('PING')
            }
        }, 30000)
    }

    function stopHeartbeat() {
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer)
            heartbeatTimer = null
        }
    }

    function scheduleReconnect() {
        clearTimeout(reconnectTimer)
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.value), 30000)
        reconnectAttempts.value++
        reconnectTimer = setTimeout(connect, delay)
    }

    function handleWsMessage(msg) {
        switch (msg.type) {
            case 'NEW_MESSAGE':
                notification.info({
                    message: msg.data.title,
                    description: `类型: ${getTypeLabel(msg.data.messageType)}`,
                    duration: 3
                })
                fetchUnreadCount()
                break

            case 'UNREAD_COUNT':
                unreadCount.value = msg.data
                break

            case 'CONNECTED':
                fetchUnreadCount()
                break
        }
    }

    async function fetchUnreadCount() {
        try {
            const data = await getUnreadCount()
            unreadCount.value = data
        } catch (e) {
            // 静默失败
        }
    }

    function decrementCount(messageType) {
        unreadCount.value.total = Math.max(0, unreadCount.value.total - 1)
        const key = messageType?.toLowerCase()
        if (key && unreadCount.value[key] !== undefined) {
            unreadCount.value[key] = Math.max(0, unreadCount.value[key] - 1)
        }
    }

    function clearCount() {
        unreadCount.value = { total: 0, announcement: 0, system: 0, alert: 0 }
    }

    function disconnect() {
        clearTimeout(reconnectTimer)
        stopHeartbeat()
        ws.value?.close()
        ws.value = null
        reconnectAttempts.value = 0
        unreadCount.value = { total: 0, announcement: 0, system: 0, alert: 0 }
    }

    function getTypeLabel(type) {
        const map = { ANNOUNCEMENT: '系统公告', SYSTEM: '系统通知', ALERT: '安全告警' }
        return map[type] || type
    }

    return {
        unreadCount, badgeCount, ws,
        connect, disconnect, fetchUnreadCount,
        decrementCount, clearCount
    }
})
