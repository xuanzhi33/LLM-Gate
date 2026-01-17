<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useErrorStore } from '@/stores/error'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const errorStore = useErrorStore()
const { isOpen, title, message } = storeToRefs(errorStore)
const { t } = useI18n()
</script>

<template>
  <AlertDialog :open="isOpen" @update:open="(val) => !val && errorStore.close()">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle class="text-destructive">{{ title || t('common.error') }}</AlertDialogTitle>
        <AlertDialogDescription class="whitespace-pre-wrap">
          {{ message }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction @click="errorStore.close()">{{ t('common.ok') }}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
