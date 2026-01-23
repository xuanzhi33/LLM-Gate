<script lang="ts" setup>
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useProxyStore } from '@/stores/proxy'
import { Activity, Play, Plug, Server, Square } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import StatusDot from './StatusDot.vue'
import EditableField from '../common/EditableField.vue'
import { useSettingsStore } from '@/stores/settings'
import { storeToRefs } from 'pinia'
import CardAction from '../ui/card/CardAction.vue'
import Badge from '../ui/badge/Badge.vue'

const { t } = useI18n()
const proxyStore = useProxyStore()
const settingsStore = useSettingsStore()
const { serverPort } = storeToRefs(settingsStore)

async function toggleProxy() {
  if (proxyStore.status === 'running') {
    await proxyStore.stop()
  } else {
    await proxyStore.start()
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center">
        <Server class="mr-2" />
        {{ t('home.title') }}
      </CardTitle>
      <CardDescription class="flex items-center">
        <StatusDot class="mr-2" />
        <div>
          {{ proxyStore.status === 'running' ? t('home.status.active') : t('home.status.stopped') }}
        </div>
      </CardDescription>
      <CardAction>
        <Button :variant="proxyStore.status === 'running' ? 'destructive' : 'default'" @click="toggleProxy">
          <Play v-if="proxyStore.status !== 'running'" />
          <Square v-else />
          {{ proxyStore.status === 'running' ? t('home.actions.stop') : t('home.actions.start') }}
        </Button>
      </CardAction>
    </CardHeader>
    <CardContent>
      <div class="flex items-center justify-between">
        <div class="w-32">
          <EditableField :modelValue="serverPort.toString()" @update:modelValue="(val) => (serverPort = parseInt(val))"
            :label="t('settings.app.serverPort')" :type="'text'" :label-icon="Plug"
            :description="t('settings.app.serverPortDesc')" />
        </div>
        <div class="flex items-center">
          <div class="flex items-center text-muted-foreground text-sm">
            <Activity class="mr-2 size-4" />
            {{ t('home.status.requestCount') }}
          </div>
          <Badge variant="outline" class="ml-2">
            {{ proxyStore.requestCount }}
          </Badge>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
