<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useModelConfigStore } from '@/stores/models'
import { useProxyStore } from '@/stores/proxy'
import { useSettingsStore } from '@/stores/settings'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Link2, Copy, Check, Info, ArrowRight, Box, ArrowDown, CheckCircle, Key } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { Label } from '../ui/label'
import Badge from '../ui/badge/Badge.vue'
import { getDomainName } from '@/utils/url'
import Input from '../ui/input/Input.vue'

const { t } = useI18n()
const router = useRouter()
const modelStore = useModelConfigStore()
const proxyStore = useProxyStore()
const settingsStore = useSettingsStore()
const { copy, copied } = useClipboard({
  legacy: true
})

const selectedModelId = ref('')
const urlFormat = ref('base')
const urlFormats = ['base', 'openai', 'openai_new', 'anthropic']

// Auto-select first model if none selected or current selection is invalid
watch(() => modelStore.configs, (configs) => {
  if (configs.length > 0) {
    const firstModel = configs[0]
    if (firstModel && (!selectedModelId.value || !configs.find(c => c.id === selectedModelId.value))) {
      selectedModelId.value = firstModel.id
    }
  } else {
    selectedModelId.value = ''
  }
}, { immediate: true })

const currentUrl = computed(() => {
  if (!selectedModelId.value) return ''

  // Use proxyStore values if running (real-time), otherwise fall back to settings
  const port = proxyStore.status === 'running' ? proxyStore.port : settingsStore.serverPort

  const base = `http://localhost:${port}/${selectedModelId.value}/v1`

  switch (urlFormat.value) {
    case 'openai':
      return `${base}/chat/completions`
    case 'openai_new':
      return `${base}/responses`
    case 'anthropic':
      return `${base}/messages`
    default:
      return base
  }
})

const selectedModel = computed(() => {
  return modelStore.configs.find(m => m.id === selectedModelId.value)
})

const copyUrl = async () => {
  if (!currentUrl.value) return
  await copy(currentUrl.value)
  toast.success(t('home.modelConnection.copySuccess'))
}

const goToModels = () => {
  router.push('/models')
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center">
        <Link2 class="mr-2" />
        {{ t('home.modelConnection.title') }}
      </CardTitle>
      <CardDescription class="text-xs">
        {{ t('home.modelConnection.description') }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div v-if="modelStore.count === 0" class="mb-4 flex flex-col items-center gap-3">
        <div class="text-muted-foreground flex items-center gap-1">
          <Info />
          {{ t('home.modelConnection.noModels') }}

        </div>
        <Button @click="goToModels" variant="outline" size="lg">
          <ArrowRight />
          {{ t('home.modelConnection.manageModels') }}
        </Button>

      </div>

      <div v-else>
        <div class="mb-3">
          <Label class="mb-2">
            <Box class="size-4" />
            {{ t('home.modelConnection.selectModel') }}
          </Label>
          <Select v-model="selectedModelId">
            <SelectTrigger class="w-full">
              <SelectValue :placeholder="t('home.modelConnection.selectModel')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="model in modelStore.configs" :key="model.id" :value="model.id">
                {{
                  model.baseUrl ?
                    getDomainName(model.baseUrl) + ' - ' : ''
                }}
                {{ model.model || model.id }}
                ({{ model.id }})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="mb-3 flex items-center gap-2 flex-wrap">
          <Label>
            <Link2 class="size-4" />
            {{ t('home.modelConnection.urlFormat') }}
          </Label>
          <Select v-model="urlFormat">
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="format in urlFormats" :key="format" :value="format">
                {{
                  t(`home.modelConnection.formats.${format}`)
                }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div v-if="selectedModel?.baseUrl">
          <div class="text-xs flex items-center gap-1">
            {{ t('home.modelConnection.baseUrl') }}
            <ArrowDown class="size-4" />
          </div>
          <div class="flex gap-1 mt-2">
            <Input :model-value="currentUrl" readonly />
            <Button variant="outline" size="icon" @click="copyUrl">
              <Check v-if="copied" class="h-4 w-4 text-green-500" />
              <Copy v-else class="h-4 w-4" />
            </Button>
          </div>

          <div class="text-xs space-y-2 mt-2">
            <div class="flex items-center gap-1">
              {{ t('home.modelConnection.forwardingInfo') }}
              <ArrowRight class="size-4 shrink-0" />
              {{ selectedModel?.baseUrl }}
            </div>
            <div v-if="selectedModel.model" class="text-green-500 flex items-center gap-1 flex-wrap">
              <CheckCircle class="size-4 shrink-0" />
              {{ t('home.modelConnection.hasModel') }}

              <ArrowRight class="size-4 shrink-0" />
              <Badge variant="secondary">{{ selectedModel.model }}</Badge>
            </div>
            <div v-else class="text-yellow-500 flex items-center gap-1">
              <Info class="size-4 shrink-0" />
              {{ t('home.modelConnection.noModelSpecified') }}
            </div>
            <div v-if="selectedModel.apiKey" class="text-muted-foreground flex items-center gap-1">
              <Key class="size-4 shrink-0" />
              {{ t('home.modelConnection.hasApiKey') }}
            </div>
            <div v-else class="text-red-500 flex items-center gap-1">
              <Key class="size-4 shrink-0" />
              {{ t('home.modelConnection.noApiKey') }}
            </div>
          </div>


        </div>
        <div v-else>
          <div class="text-sm text-red-500 mb-2 flex items-center gap-1">
            <Info class="size-4" />
            {{ t('home.modelConnection.noBaseUrl') }}
          </div>
          <Button @click="goToModels" variant="outline" size="sm">
            <ArrowRight />
            {{ t('home.modelConnection.manageModels') }}
          </Button>

        </div>
      </div>
    </CardContent>
  </Card>
</template>
