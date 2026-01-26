<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import SettingsItem from '@/components/settings/SettingsItem.vue'
import { Button } from '@/components/ui/button'
import { useUpdateStore } from '@/stores/update'
import { toast } from 'vue-sonner'
import { computed, ref } from 'vue'
import { AppWindow, Globe, Languages, LucideLogs, Settings, Settings2, SunMoon, Zap, RefreshCw, Info, GitBranch, Bug } from 'lucide-vue-next'
import { openUrl } from '@tauri-apps/plugin-opener'
import Badge from '@/components/ui/badge/Badge.vue'
import packageJson from '../../package.json'
import { ButtonGroup } from '@/components/ui/button-group'

const settingsStore = useSettingsStore()
const updateStore = useUpdateStore()
const { colorMode, language } = storeToRefs(settingsStore)
const { checking } = storeToRefs(updateStore)

const { t, availableLocales } = useI18n()

async function handleCheckUpdate() {
  try {
    const hasUpdate = await updateStore.checkUpdate()
    if (!hasUpdate) {
      toast.info(t('settings.update.noUpdate'))
    }
  } catch (e) {
    console.log(e);

    toast.error(t('settings.update.checkError'))
  }
}

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

const currentVersion = ref(packageJson.version);
const repo = ref(packageJson.homepage);

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

      <section class="space-y-3 mt-3 mb-5">
        <h2 :class="sectionTitleClass">
          <Info class="mr-2" />
          {{ t('settings.about.title') }}
        </h2>
        <div class="flex items-center justify-between">
          <div>
            <p>
              {{ t('common.title') }}
              <Badge variant="secondary">
                {{ t('settings.about.version') }}
                {{ currentVersion }}
              </Badge>
            </p>
            <p class="text-sm text-muted-foreground">
              Created by
              <Button variant="link" size="sm" @click="openUrl('https://github.com/xuanzhi33')">@xuanzhi33</Button>
            </p>
            <p class="text-xs text-muted-foreground">
              Licensed under AGPL-3.0
            </p>
            <ButtonGroup class="mt-2">
              <Button variant="outline" size="sm" @click="openUrl(repo)">
                <GitBranch />
                {{ t('settings.about.repo') }}
              </Button>
              <Button variant="outline" size="sm" @click="openUrl(repo + '/issues')">
                <Bug />
                {{ t('settings.about.reportIssue') }}
              </Button>
            </ButtonGroup>
          </div>
          <Button :disabled="checking" variant="outline" @click="handleCheckUpdate">
            <RefreshCw :class="{ 'animate-spin': checking }" />
            {{ checking ? t('settings.update.updating') : t('settings.update.checkUpdate') }}
          </Button>
        </div>
      </section>
    </div>
  </div>
</template>
