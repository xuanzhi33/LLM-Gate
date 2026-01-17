<script setup lang="ts">
import { useProxyStore } from '@/stores/proxy';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: string
}>()

const proxyStore = useProxyStore();
</script>

<template>
  <div :class="cn('relative flex h-3 w-3', props.class)">
    <span
      v-if="proxyStore.status === 'running'"
      class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
    ></span>
    <span
      class="relative inline-flex rounded-full h-full w-full"
      :class="proxyStore.status === 'running' ? 'bg-green-500' : 'bg-red-500'"
    ></span>
  </div>
</template>
