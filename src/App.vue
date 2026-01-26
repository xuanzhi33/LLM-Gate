<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useSettingsStore } from './stores/settings'
import SidebarLayout from './layout/SidebarLayout.vue'
import { SidebarProvider } from './components/ui/sidebar'
import { useModelConfigStore } from './stores/models'
import { useProxyStore } from './stores/proxy'
import { useErrorStore } from './stores/error'
import { useUpdateStore } from './stores/update'
import GlobalErrorDialog from './components/common/GlobalErrorDialog.vue'
import UpdateDialog from './components/common/UpdateDialog.vue'
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
import { useEventListener } from '@vueuse/core'
import { initTray } from './utils/tray'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()
onMounted(() => {
  const settingsStore = useSettingsStore()
  const modelsStore = useModelConfigStore()
  const proxyStore = useProxyStore()
  const errorStore = useErrorStore()
  const updateStore = useUpdateStore()

  settingsStore.applyColorMode()
  settingsStore.applyLanguage()

  modelsStore.loadFromDisk()
  proxyStore.initListeners()
  errorStore.initListeners()
  updateStore.checkUpdate()

  initTray(t)

  if (settingsStore.autoStart) {
    proxyStore.start()
  }
})

useEventListener(document, 'contextmenu', (event) => {
  const target = event.target
  if (!target) return
  if (!(target instanceof HTMLElement)) return
  const tagName = target.tagName

  if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') {
    event.preventDefault()
  }
})
</script>

<template>
  <SidebarProvider>
    <SidebarLayout>
      <RouterView v-slot="{ Component }">
        <Transition mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </SidebarLayout>
  </SidebarProvider>
  <GlobalErrorDialog />
  <UpdateDialog />
  <Toaster position="top-center" />
</template>
