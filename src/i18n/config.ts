import { createI18n } from 'vue-i18n'
import en from './en.json'
import zh from './zh.json'
import zhHant from './zh-hant.json'
const longFormat: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
}
export const i18n = createI18n({
  locale: 'en',
  legacy: false,
  messages: {
    en,
    zh,
    'zh-hant': zhHant,
  },
  datetimeFormats: {
    en: {
      long: longFormat,
    },
    zh: {
      long: longFormat,
    },
    'zh-hant': {
      long: longFormat,
    },
  },
})

export const languageNames = {
  en: 'English',
  zh: '简体中文 - Chinese (Simplified)',
  'zh-hant': '繁體中文 - Chinese (Traditional)',
}
