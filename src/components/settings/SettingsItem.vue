<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { Component } from 'vue'

interface Option {
  label: string
  value: string
}

export interface SettingsItemProps {
  label: string
  description?: string
  type?: 'input' | 'password' | 'select' | 'switch'
  placeholder?: string
  options?: Option[]
  icon?: Component
}

withDefaults(defineProps<SettingsItemProps>(), {
  type: 'input',
})

const modelValue = defineModel<string | boolean>()
</script>

<template>
  <div class="space-y-1.5">
    <Label :for="label" class="text-sm font-medium text-muted-foreground">
      <component :is="icon" v-if="icon" class="size-5" />
      {{ label }}
    </Label>


    <template v-if="type === 'select' && typeof modelValue === 'string'">
      <Select v-model="modelValue">
        <SelectTrigger :id="label">
          <SelectValue>
            {{options?.find(opt => opt.value === modelValue)?.label || placeholder}}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="opt in options" :value="opt.value" :key="opt.value">
            {{ opt.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </template>
    <template v-else-if="type === 'switch' && typeof modelValue === 'boolean'">
      <Switch v-model="modelValue" :id="label" />
    </template>
    <template v-else-if="typeof modelValue === 'string'">
      <Input :id="label" v-model="modelValue" :type="type" :placeholder="placeholder" />
    </template>

    <p v-if="description" class="text-sm text-muted-foreground">
      {{ description }}
    </p>
  </div>
</template>
