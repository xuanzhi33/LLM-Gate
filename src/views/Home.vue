<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-vue-next';

const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <div class="p-3">
    <h1 class="text-xl mb-3">
      {{ t('common.title') }}
    </h1>
    <Button variant="outline" @click="router.push('/settings')">
      <Settings />
      {{ t('settings.title') }}
    </Button>
  </div>
</template>
