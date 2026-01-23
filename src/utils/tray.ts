import { TrayIcon } from '@tauri-apps/api/tray'
import { defaultWindowIcon } from '@tauri-apps/api/app'
import { useI18n } from 'vue-i18n'
import { showWindow } from './window'
import { Menu } from '@tauri-apps/api/menu'
import { watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { exit } from '@tauri-apps/plugin-process'

const TRAY_ID = 'MAIN_TRAY'
export async function initTray(t: ReturnType<typeof useI18n>['t']) {
  const settingsStore = useSettingsStore()

  await setupTray(t)
  watch(
    () => settingsStore.language,
    async () => {
      await setupTray(t)
    },
  )
}

async function setupTray(t: ReturnType<typeof useI18n>['t']) {
  const tray = await TrayIcon.getById(TRAY_ID)
  if (tray) {
    await TrayIcon.removeById(TRAY_ID)
  }

  const menu = await Menu.new({
    items: [
      {
        text: t('menu.showWindow'),
        action: async () => {
          await showWindow()
        },
      },
      {
        text: t('menu.quit'),
        action: async () => {
          await exit()
        },
      },
    ],
  })

  await TrayIcon.new({
    menu,
    id: TRAY_ID,
    tooltip: t('common.title'),
    async action(event) {
      if (event.type !== 'Click') {
        return
      }
      if (event.buttonState !== 'Down') {
        return
      }

      if (event.button === 'Left') {
        await showWindow()
      }
    },
    showMenuOnLeftClick: false,
    icon: (await defaultWindowIcon()) || undefined,
  })
}
