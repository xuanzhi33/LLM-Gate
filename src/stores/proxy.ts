import { defineStore } from 'pinia'
import { ref } from 'vue'
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/core'
import { DEFAULT_PORT, useSettingsStore } from './settings'
import { toast } from 'vue-sonner'
import { log } from '@/utils/log'
import { useErrorStore } from './error'
import { useI18n } from 'vue-i18n'

export const useProxyStore = defineStore('proxy', () => {
  const { t } = useI18n()
  const status = ref<'running' | 'stopped'>('stopped')
  const host = ref('')
  const port = ref(DEFAULT_PORT)
  const requestCount = ref(0)

  const initListeners = async () => {
    await listen<{ status: 'running' | 'stopped'; host: string; port: number }>(
      'proxy-status-change',
      (event) => {
        const payload = event.payload
        status.value = payload.status
        if (payload.status === 'running') {
          host.value = payload.host
          port.value = payload.port
          requestCount.value = 0

          log(`Gateway server is running at ${host.value}:${port.value}`)
          toast.success(t('info.proxyStarted', { port: port.value }))
        } else {
          log('Gateway server has stopped')
          toast.success(t('info.proxyStopped'))
        }
      },
    )

    await listen<{ method: string; model_id: string; path: string }>('proxy-request', (event) => {
      const { method, model_id, path } = event.payload
      requestCount.value++
      log(`Forwarded request: [${method}] ${path} (model: ${model_id})`)
    })
  }

  const start = async () => {
    const settings = useSettingsStore()
    const errorStore = useErrorStore()
    const currentHost = settings.host
    const currentPort = settings.serverPort

    try {
      await invoke('start_proxy_server', {
        host: currentHost,
        port: currentPort,
      })
    } catch (error) {
      errorStore.showError(
        t('errors.proxyStart'),
        error instanceof Error ? error.message : String(error),
      )
    }
  }

  const stop = async () => {
    const errorStore = useErrorStore()

    try {
      await invoke('stop_proxy_server')
    } catch (error) {
      errorStore.showError(
        t('errors.proxyStop'),
        error instanceof Error ? error.message : String(error),
      )
    }
  }

  const restart = async () => {
    await stop()
    await start()
  }

  return {
    status,
    host,
    port,
    requestCount,
    initListeners,
    start,
    stop,
    restart,
  }
})
