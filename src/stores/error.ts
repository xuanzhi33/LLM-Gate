import { defineStore } from 'pinia'
import { ref } from 'vue'
import { listen } from '@tauri-apps/api/event'
import { log } from '@/utils/log'

export const useErrorStore = defineStore('error', () => {
  const isOpen = ref(false)
  const title = ref('')
  const message = ref('')

  const showError = (errorTitle: string, errorMessage: string) => {
    title.value = errorTitle
    message.value = errorMessage
    isOpen.value = true
    log(`Error Dialog shown: ${errorTitle} - ${errorMessage}`, 'error')
  }

  const close = () => {
    isOpen.value = false
    setTimeout(() => {
      title.value = ''
      message.value = ''
    }, 300)
  }

  const initListeners = async () => {
    await listen<{ title: string; message: string }>('proxy-error', (event) => {
      const { title: errorTitle, message: errorMessage } = event.payload
      showError(errorTitle, errorMessage)
    })
  }

  return {
    isOpen,
    title,
    message,
    showError,
    close,
    initListeners,
  }
})
