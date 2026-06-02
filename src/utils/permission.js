import { useUserStore } from '@/stores/user'

/**
 * 判断当前用户是否拥有指定权限
 * @param {string|string[]} perms - 权限标识或权限标识数组（满足其一即可）
 * @returns {boolean}
 */
export function hasPermi(perms) {
  const userStore = useUserStore()
  if (userStore.permissions.includes('*:*:*')) return true
  const arr = Array.isArray(perms) ? perms : [perms]
  return arr.some(p => userStore.permissions.includes(p))
}
