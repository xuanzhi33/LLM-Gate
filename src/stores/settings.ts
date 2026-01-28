import { usePreferredDark, usePreferredLanguages, useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProxyStore } from './proxy'
import { setTheme } from '@tauri-apps/api/app'

export type ColorMode = 'light' | 'dark' | 'system'

export const PREFIX = 'xuanzhi33-'
export const DEFAULT_PORT = 11456

export const useSettingsStore = defineStore('settings', () => {
  const browserDark = usePreferredDark()
  const browserLanguages = usePreferredLanguages()
  const { locale, t } = useI18n()

  const preferZh = computed(() =>
    browserLanguages.value.some((lang) => lang.startsWith('zh') || lang.startsWith('cn')),
  )

  const language = useStorage(PREFIX + 'language', preferZh.value ? 'zh' : 'en')
  const colorMode = useStorage<ColorMode>(PREFIX + 'color-mode', 'system')
  const enableLogging = useStorage(PREFIX + 'enable-logging', false)
  const serverPort = useStorage(PREFIX + 'server-port', DEFAULT_PORT)
  const autoStart = useStorage(PREFIX + 'auto-start', true)
  const exposeServer = useStorage(PREFIX + 'expose-server', false)

  const isDarkMode = computed(() => {
    if (colorMode.value === 'dark') return true
    if (colorMode.value === 'light') return false
    return browserDark.value
  })

  const applyColorMode = () => {
    document.documentElement.classList.toggle('dark', isDarkMode.value)
    setTheme(isDarkMode.value ? 'dark' : 'light')
  }

  watch(isDarkMode, applyColorMode)

  const applyLanguage = () => {
    locale.value = language.value
    document.title = t('common.title')
  }
  watch(language, applyLanguage)

  const host = computed(() => (exposeServer.value ? '0.0.0.0' : '127.0.0.1'))

  watch([serverPort, exposeServer], () => {
    const proxyStore = useProxyStore()
    if (proxyStore.status === 'running') {
      proxyStore.restart()
    }
  })

  return {
    colorMode,
    isDarkMode,
    language,
    applyColorMode,
    applyLanguage,
    enableLogging,
    serverPort,
    autoStart,
    exposeServer,
    host,
  }
})
