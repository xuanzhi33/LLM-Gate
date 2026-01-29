<script setup lang="ts">
import { ref, watch } from 'vue'
import { nanoid } from 'nanoid'
import { useModelConfigStore } from '@/stores/models'
import { useProxyStore } from '@/stores/proxy'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { openUrl } from '@tauri-apps/plugin-opener'
import { Wand2, Loader2, ExternalLink, ShieldCheck, Cloud, Key, Box } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import { providerList as providers } from '@/configs/providers'

const { t } = useI18n()
const modelStore = useModelConfigStore()
const proxyStore = useProxyStore()

const isOpen = ref(false)
const isLoading = ref(false)
const models = ref<string[]>([])
const provider = ref('')
const apiKey = ref('')
const selectedModel = ref('')
const currentId = ref('')

watch(isOpen, (newVal) => {
  if (newVal) {
    currentId.value = nanoid(6)
    provider.value = ''
    apiKey.value = ''
    selectedModel.value = ''
    models.value = []
  }
})

const handleVerify = async () => {
  if (!provider.value || !apiKey.value) return

  isLoading.value = true
  const p = providers.find(item => item.name === provider.value)!

  // Add or update temp config
  const existing = modelStore.getById(currentId.value)
  if (existing) {
    modelStore.updateConfig(currentId.value, {
      baseUrl: p.url,
      apiKey: apiKey.value
    })
  } else {
    modelStore.addConfig({
      id: currentId.value,
      baseUrl: p.url,
      apiKey: apiKey.value,
      model: ''
    })
  }

  // Force save to ensure backend can read it
  await modelStore.saveNow()

  // Wait a moment for the file to be written
  await new Promise(resolve => setTimeout(resolve, 300))

  // Ensure proxy is running
  if (proxyStore.status !== 'running') {
    await proxyStore.start()
  }

  try {
    const response = await fetch(`http://localhost:${proxyStore.port}/${currentId.value}/v1/models`)

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Status ${response.status}: ${text}`)
    }

    const data = await response.json()
    // Handle OpenAI format { data: [{ id: '...' }, ...] }
    if (data.data && Array.isArray(data.data)) {
      models.value = data.data.map((m: { id: string }) => m.id)
      toast.success(t('models.wizard.verifySuccess'))
    } else {
      throw new Error('Invalid response format')
    }
  } catch (e) {
    console.error(e)
    toast.error(t('models.wizard.verifyFail') + ': ' + String(e))
  } finally {
    isLoading.value = false
  }
}

const handleFinish = () => {
  // Update with selected model
  if (selectedModel.value) {
    modelStore.updateConfig(currentId.value, {
      model: selectedModel.value
    })
    // Save again
    modelStore.saveNow()
  }
  isOpen.value = false
}

const openProviderUrl = () => {
  const p = providers.find(item => item.name === provider.value)
  if (p) {
    openUrl(p.keyUrl)
  }
}

</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <Button variant="secondary">
        <Wand2 class="w-4 h-4" />
        {{
          t('models.wizard.title')
        }}
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t('models.wizard.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('models.wizard.description') }}
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-3">
        <!-- Provider -->
        <div class="grid gap-2">
          <Label>
            <Cloud class="size-4" />
            {{ t('models.wizard.provider') }}
          </Label>
          <div class="flex items-center">
            <Select v-model="provider">
              <SelectTrigger>
                <SelectValue :placeholder="t('models.wizard.selectProvider')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="p in providers" :key="p.name" :value="p.name">
                  {{ p.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="link" class="text-xs" @click="openProviderUrl">
              {{ t('models.wizard.getApiKey') }}
              <ExternalLink class="w-3 h-3" />
            </Button>
          </div>
        </div>

        <!-- API Key -->
        <div class="grid gap-2" v-if="provider">
          <Label>
            <Key class="size-4" />
            {{ t('models.form.apiKey') }}
          </Label>

          <Input v-model="apiKey" type="password" :placeholder="t('models.form.apiKeyPlaceholder')" />
        </div>

        <!-- Verify Button -->
        <Button v-if="provider && apiKey" @click="handleVerify" :disabled="isLoading" variant="outline" class="w-full">
          <Loader2 v-if="isLoading" class="animate-spin" />
          <ShieldCheck v-else />
          {{ t('models.wizard.verify') }}
        </Button>

        <!-- Model Selection -->
        <div class="grid gap-2" v-if="models.length > 0">
          <Label>
            <Box class="size-4" />
            {{ t('models.wizard.selectModel') }}
          </Label>
          <Select v-model="selectedModel">
            <SelectTrigger>
              <SelectValue :placeholder="t('models.wizard.selectModel')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="m in models" :key="m" :value="m">
                {{ m }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button @click="handleFinish" :disabled="!provider || !apiKey">
          {{ t('models.wizard.finish') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
