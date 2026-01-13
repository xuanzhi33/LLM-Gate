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
import type { Component } from 'vue'

interface Option {
  label: string
  value: string
}

export interface SettingsItemProps {
  label: string
  description?: string
  type?: 'input' | 'password' | 'select'
  placeholder?: string
  options?: Option[]
  icon?: Component
}

const props = withDefaults(defineProps<SettingsItemProps>(), {
  type: 'input',
})

const modelValue = defineModel<string>()
</script>

<template>
  <div class="space-y-1.5">
    <Label :for="label" class="text-sm font-medium text-muted-foreground">
      <component :is="icon" v-if="icon" class="size-6" />
      {{ label }}
    </Label>

    <template v-if="type === 'input' || type === 'password'">
      <Input :id="label" v-model="modelValue" :type="type" :placeholder="placeholder" />
    </template>

    <template v-else-if="type === 'select'">
      <Select v-model="modelValue">
        <SelectTrigger :id="label">
          <SelectValue>
            {{options?.find(opt => opt.value === modelValue)?.label || placeholder}}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="opt in options" :value="opt.value">
            {{ opt.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </template>

    <p v-if="description" class="text-sm text-muted-foreground">
      {{ description }}
    </p>
  </div>
</template>
