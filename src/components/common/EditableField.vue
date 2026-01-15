<script setup lang="ts">
import { ref, nextTick, watch, type Component } from 'vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Pencil, Check, X, Loader2, Clipboard } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { useClipboard } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import Badge from '../ui/badge/Badge.vue'
import InputGroup from '../ui/input-group/InputGroup.vue'
import InputGroupInput from '../ui/input-group/InputGroupInput.vue'
import { InputGroupAddon, InputGroupButton } from '../ui/input-group'
import { nanoid } from 'nanoid'
import { toast } from 'vue-sonner'

interface Props {
  label: string
  modelValue: string
  description: string
  labelIcon?: Component
  type?: 'text' | 'password'
  placeholder?: string
  validate?: (value: string) => string | undefined // Return error message or undefined
  onSave?: (newValue: string) => Promise<void> | void
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()
const { copy, copied } = useClipboard({ legacy: true })

const isEditing = ref(false)
const isLoading = ref(false)
const localValue = ref(props.modelValue)
const error = ref('')
const inputId = ref(`editable-field-input-${nanoid()}`)

// Watch for external value changes
watch(() => props.modelValue, (newVal) => {
  if (!isEditing.value) {
    localValue.value = newVal
  }
})

const startEdit = async () => {
  localValue.value = props.modelValue
  isEditing.value = true
  error.value = ''
  await nextTick();
  (document.getElementById(inputId.value) as HTMLInputElement | null)?.select()
}

const cancelEdit = () => {
  isEditing.value = false
  localValue.value = props.modelValue
  error.value = ''
}

const handleSave = async () => {
  error.value = ''

  if (props.validate) {
    const validationError = props.validate(localValue.value)
    if (validationError) {
      error.value = validationError
      toast.error(validationError)
      return
    }
  }

  isLoading.value = true
  try {
    if (props.onSave) {
      await props.onSave(localValue.value)
    }
    emit('update:modelValue', localValue.value)
    isEditing.value = false
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSave()
  } else if (e.key === 'Escape') {
    cancelEdit()
  }
}
</script>

<template>
  <div>
    <TooltipProvider>
      <Tooltip :open="isEditing">
        <TooltipContent>
          <div>
            <Badge>
              {{ label }}
            </Badge>
            {{ description }}
          </div>
        </TooltipContent>
        <TooltipTrigger as-child>
          <div class="h-10">
            <!-- View Mode Content -->
            <div v-if="!isEditing" class="flex items-center h-full">
              <div class="flex-1">

                <!-- Header/Label Row -->
                <div class="flex items-center space-x-1 text-muted-foreground">
                  <component :is="labelIcon" v-if="labelIcon" class="size-3" />
                  <Label class="text-xs">{{ label }}</Label>
                </div>

                <!-- Value Display -->
                <div class="mt-1">
                  <!-- Empty State -->
                  <div v-if="!modelValue">
                    <Badge variant="outline" class="text-xs text-muted-foreground">
                      {{ t('common.empty') }}
                    </Badge>
                  </div>

                  <!-- Value State -->
                  <div v-else>
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <div
                          :class="cn('font-mono truncate text-sm max-w-44', type === 'password' ? 'text-muted-foreground' : '')">
                          {{ type === 'password' ? '•'.repeat(6) : modelValue }}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <div class="font-mono">
                          {{ modelValue }}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <div class="flex">
                <!-- Copy Button -->
                <Tooltip v-if="modelValue">
                  <TooltipTrigger as-child>
                    <Button variant="ghost" size="icon" @click="copy(modelValue)">
                      <Check v-if="copied" class="text-green-500" />
                      <Clipboard v-else class="text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {{ copied ? t('common.copied') : t('common.copy') }}
                  </TooltipContent>
                </Tooltip>

                <!-- Edit Trigger -->
                <Tooltip :disabled="!modelValue">
                  <TooltipTrigger as-child>
                    <Button :variant="modelValue ? 'ghost' : 'outline'" :size="modelValue ? 'icon' : 'sm'"
                      @click="startEdit">
                      <Pencil class="text-muted-foreground" />
                      <template v-if="!modelValue">{{ t('common.fill') }}</template>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {{ t('common.edit') }}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <!-- Edit Mode -->
            <div v-else class="h-full flex items-center">
              <InputGroup>
                <InputGroupInput :id="inputId" v-model="localValue" :type="type" :placeholder="placeholder"
                  class="font-mono text-sm p-1" @keydown="handleKeydown" :disabled="isLoading" />
                <InputGroupAddon :align="'inline-end'">
                  <InputGroupButton size="icon-xs" variant="outline" @click="cancelEdit" :disabled="isLoading">
                    <X class="text-destructive" />
                  </InputGroupButton>
                  <InputGroupButton size="icon-xs" variant="default" @click="handleSave" :disabled="isLoading">
                    <Loader2 v-if="isLoading" class="animate-spin" />
                    <Check v-else />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        </TooltipTrigger>


      </Tooltip>
    </TooltipProvider>
  </div>
</template>
