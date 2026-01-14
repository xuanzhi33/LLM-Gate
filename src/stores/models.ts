import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { loadJSON, saveJSON } from '@/utils/app-data'
import { useDebounceFn } from '@vueuse/core'
export type ModelConfig = {
  id: string
  model?: string
  baseUrl?: string
  apiKey?: string
}

const CONFIG_FILE = 'model-config.json'

export const useModelConfigStore = defineStore('modelConfig', () => {
  const configs = ref<ModelConfig[]>([])

  const count = computed(() => configs.value.length)

  const getById = (id: string) => configs.value.find((item) => item.id === id)

  const addConfig = (config: ModelConfig) => {
    configs.value.push(config)
  }

  const updateConfig = (id: string, patch: Partial<ModelConfig>) => {
    const index = configs.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      configs.value[index] = {
        id,
        ...configs.value[index],
        ...patch,
      }
    }
  }

  const removeConfig = (id: string) => {
    configs.value = configs.value.filter((item) => item.id !== id)
  }

  const reset = () => {
    configs.value = []
  }

  const saveToDisk = useDebounceFn(async () => {
    saveJSON(configs.value, CONFIG_FILE)
  }, 1000)

  const loadFromDisk = async () => {
    const data = await loadJSON<ModelConfig[]>(CONFIG_FILE)
    if (data) {
      configs.value = data
    }
  }

  watch(
    configs,
    () => {
      saveToDisk()
    },
    { deep: true },
  )

  return {
    configs,
    count,
    getById,
    addConfig,
    updateConfig,
    removeConfig,
    reset,
    loadFromDisk,
  }
})
