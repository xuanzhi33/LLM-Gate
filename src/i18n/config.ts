import { createI18n } from 'vue-i18n'
import en from './en.json'
import zh from './zh.json'
export const i18n = createI18n({
  locale: 'en',
  legacy: false,
  messages: {
    en,
    zh,
  },
})
