<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router'
import { useSettingsStore } from './stores/settings';
import SidebarLayout from './layout/SidebarLayout.vue';
import { SidebarProvider } from './components/ui/sidebar';

onMounted(() => {
  const settingsStore = useSettingsStore();
  settingsStore.applyColorMode();
  settingsStore.applyLanguage();
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
</template>
