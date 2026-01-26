import { defineStore } from 'pinia'
import { check, type Update } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { ref, shallowRef } from 'vue'
import { error } from '@tauri-apps/plugin-log'

export const useUpdateStore = defineStore('update', () => {
  const checking = ref(false)
  const updateAvailable = ref(false)
  const updateInfo = shallowRef<Update | null>(null)

  const downloading = ref(false)
  const downloadProgress = ref(0)
  const downloadTotal = ref(0)
  const downloadedBytes = ref(0)

  const installing = ref(false)

  const showDialog = ref(false)

  const errorMsg = ref<string | null>(null)

  async function checkUpdate() {
    if (checking.value) return false

    checking.value = true
    errorMsg.value = null

    try {
      const update = await check()
      if (update) {
        updateAvailable.value = true
        updateInfo.value = update
        showDialog.value = true
        return true
      } else {
        updateAvailable.value = false
        updateInfo.value = null
        return false
      }
    } catch (e) {
      error(`Failed to check for updates: ${e}`)
      errorMsg.value = e instanceof Error ? e.message : String(e)
      throw e
    } finally {
      checking.value = false
    }
  }

  async function startDownload() {
    if (!updateInfo.value) return

    downloading.value = true
    downloadProgress.value = 0
    downloadedBytes.value = 0
    downloadTotal.value = 0
    errorMsg.value = null

    try {
      await updateInfo.value.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            downloadTotal.value = event.data.contentLength || 0
            break
          case 'Progress':
            downloadedBytes.value += event.data.chunkLength
            if (downloadTotal.value > 0) {
              downloadProgress.value = (downloadedBytes.value / downloadTotal.value) * 100
            }
            break
          case 'Finished':
            downloading.value = false
            installing.value = true
            break
        }
      })

      await relaunch()
    } catch (e) {
      error(`Failed to download/install update: ${e}`)
      downloading.value = false
      installing.value = false
      errorMsg.value = e instanceof Error ? e.message : String(e)
    }
  }

  function dismiss() {
    showDialog.value = false
  }

  return {
    checking,
    updateAvailable,
    updateInfo,
    downloading,
    downloadProgress,
    downloadTotal,
    downloadedBytes,
    installing,
    showDialog,
    errorMsg,

    checkUpdate,
    startDownload,
    dismiss,
  }
})
