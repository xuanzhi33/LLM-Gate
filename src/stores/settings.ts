import { usePreferredDark, usePreferredLanguages } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, watch } from 'vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

export type ColorMode = 'light' | 'dark' | 'system'

export const LOCAL_STORAGE_KEY_PREFIX = 'xuanzhi33-'

export const useSettingsStore = defineStore('settings', () => {
  const browserDark = usePreferredDark()
  const browserLanguages = usePreferredLanguages()
  const { locale, t } = useI18n()

  const preferZh = computed(() =>
    browserLanguages.value.some((lang) => lang.startsWith('zh') || lang.startsWith('cn')),
  )

  const language = ref(
    localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'language') || (preferZh.value ? 'zh' : 'en'),
  )
  const colorMode = ref(
    (localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'color-mode') as ColorMode) || 'system',
  )

  const persist = (key: string, value: string) => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + key, value)
  }

  const saveSettings = () => {
    persist('color-mode', colorMode.value)
    persist('language', language.value)
  }

  watch([colorMode, language], saveSettings)

  const isDarkMode = computed(() => {
    if (colorMode.value === 'dark') return true
    if (colorMode.value === 'light') return false
    return browserDark.value
  })

  const applyColorMode = () => {
    document.documentElement.classList.toggle('dark', isDarkMode.value)
  }

  watch(isDarkMode, applyColorMode)

  const applyLanguage = () => {
    locale.value = language.value
    document.title = t('common.title')
  }
  watch(language, applyLanguage)

  return {
    colorMode,
    isDarkMode,
    language,
    applyColorMode,
    applyLanguage,
  }
})
