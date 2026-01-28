<script setup lang="ts">
import type { ModelConfig } from '@/stores/models'
import { useModelConfigStore } from '@/stores/models'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import EditableField from '@/components/common/EditableField.vue'
import { Trash2, Link2, Key, Hash, FileText, Sparkle, Copy } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import CardTitle from '../ui/card/CardTitle.vue'
import { getDomainName } from '@/utils/url'
import Badge from '../ui/badge/Badge.vue'
import CardAction from '../ui/card/CardAction.vue'
import { ButtonGroup } from '../ui/button-group'

interface Props {
  model: ModelConfig
  isNew?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isNew: false
})

const emit = defineEmits<{
  delete: [id: string]
  copy: [id: string]
}>()

const { t } = useI18n()
const store = useModelConfigStore()

// Update handler
const updateField = async (key: keyof ModelConfig, value: string) => {
  // Update store
  store.updateConfig(props.model.id, { [key]: value })
}

// Validate ID for EditableField
const validateId = (val: string) => {
  if (!val.trim()) return t('models.errors.idRequired')
  if (val !== props.model.id && store.getById(val)) return t('models.errors.idExists')
  return undefined
}
</script>

<template>
  <Card :class="{ 'animate-flash-border': isNew }">
    <CardHeader class="-m-3">
      <CardTitle class="flex items-center leading-6">
        <Sparkle class="size-6 mr-2" />
        <div class="capitalize max-w-32 truncate">
          {{ getDomainName(model.baseUrl || "") || model.id }}
        </div>
        <Badge v-if="model.model" class="ml-2 max-w-28" variant="secondary">
          {{ model.model.split('/').pop() }}
        </Badge>
      </CardTitle>
      <CardAction class="-m-1">
        <ButtonGroup>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="secondary" size="icon-sm" @click="emit('copy', model.id)">
                  <Copy class="text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{{ t('common.copy') }}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="secondary" size="icon-sm" @click="emit('delete', model.id)">
                  <Trash2 class="text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{{ t('models.delete') }}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </ButtonGroup>

      </CardAction>
    </CardHeader>

    <CardContent class="space-y-3 -m-2 mt-0">
      <!-- ID -->
      <EditableField :label="t('models.form.id')" :model-value="model.id" :placeholder="t('models.form.idPlaceholder')"
        :description="t('models.form.idDesc')" :validate="validateId" :label-icon="Hash"
        @update:model-value="(v) => updateField('id', v)" />
      <!-- Model Name (Title) -->
      <EditableField :label="t('models.form.model')" :is-new="isNew" :model-value="model.model || ''"
        :placeholder="t('models.form.modelPlaceholder')" :description="t('models.form.modelDesc')"
        :label-icon="FileText" @update:model-value="(v) => updateField('model', v)" />


      <!-- Base URL -->
      <EditableField :label="t('models.form.baseUrl')" :model-value="model.baseUrl || ''"
        :placeholder="t('models.form.baseUrlPlaceholder')" :description="t('models.form.baseUrlDesc')"
        :label-icon="Link2" @update:model-value="(v) => updateField('baseUrl', v)" />

      <!-- API Key -->
      <EditableField :label="t('models.form.apiKey')" :model-value="model.apiKey || ''" type="password"
        :placeholder="t('models.form.apiKeyPlaceholder')" :description="t('models.form.apiKeyDesc')" :label-icon="Key"
        @update:model-value="(v) => updateField('apiKey', v)" />
    </CardContent>
  </Card>
</template>
