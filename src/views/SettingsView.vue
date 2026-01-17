<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import SettingsItem from '@/components/settings/SettingsItem.vue'
import { computed } from 'vue'
import { AppWindow, Globe, Languages, LucideLogs, Settings, Settings2, SunMoon, Zap } from 'lucide-vue-next'
const settingsStore = useSettingsStore()
const { colorMode, language } = storeToRefs(settingsStore)

const { t, availableLocales } = useI18n()

const colorOptions = computed(() => {
  return ['light', 'dark', 'system'].map(mode => ({
    label: t(`settings.interface.colorModeOptions.${mode}`),
    value: mode
  }))
})

const localeOptions = computed(() => availableLocales.map(loc => ({
  label: t(`settings.interface.languageOptions.${loc}`),
  value: loc
})))

const sectionTitleClass = 'font-semibold text-muted-foreground border-b pt-3 pb-2 flex items-center'

</script>

<template>
  <div class="p-4 overflow-y-auto h-full">
    <div class="mx-auto">
      <h1 class="text-2xl font-extrabold mb-2 flex items-center">
        <Settings class="mr-2 size-6" />
        {{ t('settings.title') }}
      </h1>
      <section class="space-y-3">
        <h2 :class="sectionTitleClass">
          <AppWindow class="mr-2" />
          {{ t('settings.interface.title') }}
        </h2>

        <SettingsItem v-model="colorMode" :label="t('settings.interface.colorMode')" type="select" :icon="SunMoon"
          :options="colorOptions" />

        <SettingsItem v-model="language" :label="t('settings.interface.language')" type="select" :icon="Languages"
          :options="localeOptions" />
      </section>
      <section class="space-y-3 mt-3">
        <h2 :class="sectionTitleClass">
          <Settings2 class="mr-2" />
          {{ t('settings.app.title') }}
        </h2>
        <SettingsItem :icon="Zap" v-model="settingsStore.autoStart" :label="t('settings.app.autoStart')"
          :description="t('settings.app.autoStartDesc')" type="switch" />
        <SettingsItem :icon="Globe" v-model="settingsStore.exposeServer" :label="t('settings.app.exposeServer')"
          :description="t('settings.app.exposeServerDesc')" type="switch" />
        <SettingsItem :icon="LucideLogs" v-model="settingsStore.enableLogging" :label="t('settings.app.enableLogging')"
          :description="t('settings.app.enableLoggingDesc')" type="switch" />
      </section>
    </div>
  </div>
</template>
