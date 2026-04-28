<template>
  <a-config-provider :theme="themeConfig">
    <router-view />
  </a-config-provider>
</template>

<script setup>
import { computed } from 'vue'
import { theme } from 'ant-design-vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const themeConfig = computed(() => ({
  algorithm: themeStore.isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: themeStore.isDark
    ? {
        colorPrimary: '#4f8cff',
        colorBgBase: '#101114',
        colorBgLayout: '#101114',
        colorBgContainer: '#171a20',
        colorBgElevated: '#1b1f27',
        colorBorder: '#2a303b',
        colorSplit: '#242a35',
        colorText: 'rgba(255, 255, 255, 0.88)',
        colorTextSecondary: 'rgba(255, 255, 255, 0.62)',
        colorTextTertiary: 'rgba(255, 255, 255, 0.42)',
        borderRadius: 8,
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.28)'
      }
    : {
        colorPrimary: '#1677ff',
        borderRadius: 8
      },
  components: themeStore.isDark
    ? {
        Layout: {
          bodyBg: '#101114',
          headerBg: '#171a20',
          siderBg: '#111318'
        },
        Card: {
          colorBgContainer: '#171a20'
        },
        Table: {
          headerBg: '#1d222b',
          headerColor: 'rgba(255, 255, 255, 0.72)',
          rowHoverBg: '#202631',
          borderColor: '#242a35'
        },
        Menu: {
          darkItemBg: '#111318',
          darkSubMenuItemBg: '#111318',
          darkItemSelectedBg: '#1f4fbf',
          itemSelectedBg: 'rgba(79, 140, 255, 0.14)'
        },
        Modal: {
          contentBg: '#171a20',
          headerBg: '#171a20'
        }
      }
    : {}
}))
</script>
