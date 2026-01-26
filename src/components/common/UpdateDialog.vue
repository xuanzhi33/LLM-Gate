<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useUpdateStore } from '@/stores/update'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { ArrowUpCircle, Download, RefreshCw } from 'lucide-vue-next'

const updateStore = useUpdateStore()
const {
  showDialog,
  updateInfo,
  downloading,
  downloadProgress,
  installing,
  errorMsg
} = storeToRefs(updateStore)
const { t, d } = useI18n()

const handleClose = (open: boolean) => {
  if (!open && !downloading.value && !installing.value) {
    updateStore.dismiss()
  }
}
</script>

<template>
  <Dialog :open="showDialog" @update:open="handleClose">
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <ArrowUpCircle />
          {{ t('settings.update.available') }}
        </DialogTitle>
        <DialogDescription>
          <span v-if="updateInfo">
            v{{ updateInfo.version }} ({{ d(new Date(updateInfo.date || ''), 'long') }})
          </span>
        </DialogDescription>
      </DialogHeader>

      <div>
        <div v-if="errorMsg" class="text-destructive bg-destructive/10 p-2">
          {{ errorMsg }}
        </div>

        <div v-if="!downloading && !installing">
          <p class="text-sm text-muted-foreground whitespace-pre-wrap max-h-50 overflow-y-auto bg-muted p-2">
            {{ updateInfo?.body }}
          </p>
        </div>

        <div v-if="downloading || installing">
          <div class="flex justify-between text-sm mb-2">
            <span v-if="downloading" class="flex items-center gap-1">
              <RefreshCw class="animate-spin size-4" />
              {{ t('settings.update.downloading') }}
            </span>
            <span v-if="installing">{{ t('settings.update.installing') }}</span>
            <span v-if="downloading">{{ Math.round(downloadProgress) }}%</span>
          </div>
          <Progress :model-value="downloadProgress" />
        </div>

      </div>

      <DialogFooter>
        <Button variant="ghost" @click="updateStore.dismiss()" :disabled="downloading || installing">
          {{ t('common.cancel') }}
        </Button>

        <Button @click="updateStore.startDownload()" :disabled="downloading || installing">
          <Download v-if="!downloading && !installing" />
          <RefreshCw class="animate-spin" v-else />
          {{ downloading || installing ? t('settings.update.updating') : t('settings.update.update_now') }}
        </Button>

      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
