<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import SettingsItem from '@/components/settings/SettingsItem.vue'
import { computed } from 'vue'
import { AppWindow, Languages, Settings, SunMoon } from 'lucide-vue-next'
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

const sectionTitleClass = 'font-semibold text-muted-foreground border-b pt-3 pb-2'

</script>

<template>
  <div class="p-5 overflow-y-auto h-full">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-extrabold mb-2 pt-3 flex items-center">
        <Settings class="mr-2 size-8" />
        {{ t('settings.title') }}
      </h1>
      <section class="space-y-3">
        <h2 :class="sectionTitleClass" class="flex items-center">
          <AppWindow class="mr-2" />
          {{ t('settings.interface.title') }}
        </h2>

        <SettingsItem v-model="colorMode" :label="t('settings.interface.colorMode')" type="select" :icon="SunMoon"
          :options="colorOptions" />

        <SettingsItem v-model="language" :label="t('settings.interface.language')" type="select" :icon="Languages"
          :options="localeOptions" />
      </section>
    </div>
  </div>
</template>
