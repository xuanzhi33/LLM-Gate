<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router'
import { useSettingsStore } from './stores/settings';
import SidebarLayout from './layout/SidebarLayout.vue';
import { SidebarProvider } from './components/ui/sidebar';
import { useModelConfigStore } from './stores/models';
import { useProxyStore } from './stores/proxy';
import { useErrorStore } from './stores/error';
import GlobalErrorDialog from './components/common/GlobalErrorDialog.vue';
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css'

onMounted(() => {
  const settingsStore = useSettingsStore();
  const modelsStore = useModelConfigStore();
  const proxyStore = useProxyStore();
  const errorStore = useErrorStore();
  
  settingsStore.applyColorMode();
  settingsStore.applyLanguage();

  modelsStore.loadFromDisk();
  proxyStore.initListeners();
  errorStore.initListeners();

  if (settingsStore.autoStart) {
    proxyStore.start();
  }
});
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
  <Toaster position="top-center" />
</template>
