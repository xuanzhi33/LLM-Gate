import { invoke } from '@tauri-apps/api/core'

export interface ProxyOptions {
  host: string
  port: number
}

export const startProxyServer = async (options: ProxyOptions): Promise<string> => {
  return await invoke<string>('start_proxy_server', {
    host: options.host,
    port: options.port,
  })
}

export const stopProxyServer = async (): Promise<string> => {
  return await invoke<string>('stop_proxy_server')
}
