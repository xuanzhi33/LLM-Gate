<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router'
import { useSettingsStore } from './stores/settings';
import SidebarLayout from './layout/SidebarLayout.vue';
import { SidebarProvider } from './components/ui/sidebar';
import { useModelConfigStore } from './stores/models';
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css'

onMounted(() => {
  const settingsStore = useSettingsStore();
  const modelsStore = useModelConfigStore();
  settingsStore.applyColorMode();
  settingsStore.applyLanguage();

  modelsStore.loadFromDisk();
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
  <Toaster position="top-center" />
</template>
