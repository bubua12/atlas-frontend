import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getWatermarkConfig } from '@/api/config'
import { useUserStore } from '@/stores/user'

const DEFAULT_TEXT = 'Atlas System'
const DEFAULT_OPACITY = 0.1
const DEFAULT_DENSITY = 3
const DEFAULT_FONT_SIZE = 14
const DEFAULT_FONT_FAMILY = 'Microsoft YaHei'
const DEFAULT_FONT_COLOR = '#8f96a3'
// Ant Design Vue Watermark 的 gap 配置，数值越小水印越密。
const DENSITY_GAPS = {
  1: [248, 188],
  2: [204, 156],
  3: [168, 128],
  4: [132, 102],
  5: [104, 82]
}

// 后端只保存模板字符串，前端在运行时按当前登录用户信息替换变量。
const TEMPLATE_TOKENS = {
  loginName: /\$\{loginName\}/g,
  employeeNo: /\$\{employeeNo\}/g,
  phone: /\$\{phone\}/g,
  deptName: /\$\{deptName\}/g,
  companyName: /\$\{companyName\}/g,
  currentTime: /\$\{currentTime\}/g
}

export const useWatermarkStore = defineStore('watermark', () => {
  const userStore = useUserStore()
  const enabled = ref(false)
  const text = ref(DEFAULT_TEXT)
  const opacity = ref(DEFAULT_OPACITY)
  const density = ref(DEFAULT_DENSITY)
  const customEnabled = ref(false)
  const customContent = ref('')
  const fontSize = ref(DEFAULT_FONT_SIZE)
  const fontFamily = ref(DEFAULT_FONT_FAMILY)
  const fontColor = ref(DEFAULT_FONT_COLOR)
  const loaded = ref(false)
  const loading = ref(false)
  const now = ref(new Date())
  let timer = null

  // 最终传给 a-watermark 的水印内容，关闭水印时返回空字符串。
  const content = computed(() => {
    if (!enabled.value) return ''
    const template = customEnabled.value ? customContent.value : text.value
    return resolveTemplate(normalizeText(template), userStore, now.value)
  })

  const normalizedOpacity = computed(() => normalizeOpacity(opacity.value))
  // 将 1-5 的密度等级转换为 a-watermark 需要的横纵间距。
  const gap = computed(() => DENSITY_GAPS[normalizeDensity(density.value)] || DENSITY_GAPS[DEFAULT_DENSITY])
  // 字体颜色需要合并透明度，a-watermark 最终接收 rgba 颜色值。
  const font = computed(() => ({
    color: hexToRgba(normalizeColor(fontColor.value), normalizedOpacity.value),
    fontSize: normalizeFontSize(fontSize.value),
    fontWeight: 600,
    fontFamily: fontFamily.value || DEFAULT_FONT_FAMILY
  }))

  async function load(force = false) {
    if (loading.value) return
    if (loaded.value && !force) return

    loading.value = true
    try {
      const config = await getWatermarkConfig()
      applyConfig(config)
      startClock()
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  // 后端返回的运行时配置先统一归一化，再写入 store，避免组件层处理脏值。
  function applyConfig(config = {}) {
    enabled.value = Boolean(config.enabled)
    text.value = normalizeText(config.text)
    opacity.value = normalizeOpacity(config.opacity)
    density.value = normalizeDensity(config.density)
    customEnabled.value = Boolean(config.customEnabled)
    customContent.value = typeof config.customContent === 'string' ? config.customContent : ''
    fontSize.value = normalizeFontSize(config.fontSize)
    fontFamily.value = config.fontFamily || DEFAULT_FONT_FAMILY
    fontColor.value = normalizeColor(config.fontColor)
  }

  // 退出登录或切换用户时清理水印状态，避免残留上一个用户的水印。
  function reset() {
    enabled.value = false
    text.value = DEFAULT_TEXT
    opacity.value = DEFAULT_OPACITY
    density.value = DEFAULT_DENSITY
    customEnabled.value = false
    customContent.value = ''
    fontSize.value = DEFAULT_FONT_SIZE
    fontFamily.value = DEFAULT_FONT_FAMILY
    fontColor.value = DEFAULT_FONT_COLOR
    loaded.value = false
    loading.value = false
  }

  // currentTime 变量按分钟刷新即可，避免频繁重绘页面水印。
  function startClock() {
    if (timer) return
    timer = window.setInterval(() => {
      now.value = new Date()
    }, 60 * 1000)
  }

  return {
    enabled,
    text,
    opacity,
    density,
    customEnabled,
    customContent,
    fontSize,
    fontFamily,
    fontColor,
    loaded,
    loading,
    content,
    normalizedOpacity,
    gap,
    font,
    load,
    applyConfig,
    reset
  }
})

// 以下 normalize 方法和后端校验保持同一边界，兼容历史脏数据或接口异常值。
function normalizeText(value) {
  const text = typeof value === 'string' ? value.trim() : ''
  return text || DEFAULT_TEXT
}

function normalizeOpacity(value) {
  const opacity = Number(value)
  if (Number.isNaN(opacity)) return DEFAULT_OPACITY
  return Math.min(1, Math.max(0, opacity))
}

function normalizeDensity(value) {
  const density = Number(value)
  if (Number.isNaN(density)) return DEFAULT_DENSITY
  return Math.min(5, Math.max(1, Math.round(density)))
}

function normalizeFontSize(value) {
  const fontSize = Number(value)
  if (Number.isNaN(fontSize)) return DEFAULT_FONT_SIZE
  return Math.min(48, Math.max(10, fontSize))
}

function normalizeColor(value) {
  return /^#[0-9a-fA-F]{6}$/.test(value || '') ? value : DEFAULT_FONT_COLOR
}

function hexToRgba(hex, opacity) {
  const normalizedHex = normalizeColor(hex).replace('#', '')
  const red = parseInt(normalizedHex.slice(0, 2), 16)
  const green = parseInt(normalizedHex.slice(2, 4), 16)
  const blue = parseInt(normalizedHex.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${normalizeOpacity(opacity)})`
}

// 将水印模板中的变量替换为当前登录用户上下文。
function resolveTemplate(template, userStore, date) {
  const profile = userStore.profile || {}
  const replacements = {
    loginName: profile.nickname || userStore.username || '',
    employeeNo: profile.employeeNo || profile.username || userStore.username || '',
    phone: profile.phone || '',
    deptName: profile.deptName || '',
    companyName: profile.companyName || 'Atlas',
    currentTime: formatDateTime(date)
  }

  return Object.entries(TEMPLATE_TOKENS).reduce(
    (content, [key, pattern]) => content.replace(pattern, replacements[key]),
    template
  )
}

// 水印里的当前时间只展示到分钟，和刷新频率保持一致。
function formatDateTime(date) {
  const pad = value => String(value).padStart(2, '0')
  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    ' ',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes())
  ].join('')
}
