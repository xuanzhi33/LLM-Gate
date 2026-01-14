import { useSettingsStore } from '@/stores/settings'
import { error, info, warn } from '@tauri-apps/plugin-log'

export function log(message: string, level: 'info' | 'error' | 'warn' = 'info') {
  const settingsStore = useSettingsStore()
  if (!settingsStore.enableLogging) return

  console.log(`[${level.toUpperCase()}] ${message}`)
  if (level === 'info') {
    info(message)
  } else if (level === 'error') {
    error(message)
  } else if (level === 'warn') {
    warn(message)
  }
}
