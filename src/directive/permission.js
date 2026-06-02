import { hasPermi } from '@/utils/permission'

/**
 * v-hasPermi 自定义指令
 * 用法：v-hasPermi="['system:user:add']" 或 v-hasPermi="'system:user:add'"
 * 无权限时元素从 DOM 中移除（v-if 语义）
 */
export const hasPermiDirective = {
  mounted(el, binding) {
    const perms = binding.value
    if (!perms) return
    if (!hasPermi(perms)) {
      el.parentNode?.removeChild(el)
    }
  }
}
