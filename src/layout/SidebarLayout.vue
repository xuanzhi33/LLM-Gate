<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { Home, Package, PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-vue-next';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import StatusDot from '@/components/dashboard/StatusDot.vue';
import { useProxyStore } from '@/stores/proxy';

const { t } = useI18n()
const route = useRoute()
const proxyStore = useProxyStore()

const { open, setOpenMobile, isMobile, toggleSidebar } = useSidebar();
const items = computed(() => [
  {
    title: t('common.home'),
    name: 'home',
    icon: Home,
  },
  {
    title: t('models.title'),
    name: 'models',
    icon: Package,
  },
  {
    title: t('settings.title'),
    name: 'settings',
    icon: Settings,
  },
])

const toggleProxy = async () => {
  if (proxyStore.status === 'running') {
    await proxyStore.stop()
  } else {
    await proxyStore.start()
  }
}
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <SidebarMenuButton size="lg" class="text-xl font-bold" @click="toggleProxy">
                  <div class="ml-2 mr-2">
                    <StatusDot class="size-4" />
                  </div>
                  <h1 class="truncate">
                    {{ t('common.title') }}
                  </h1>
                </SidebarMenuButton>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{{ proxyStore.status === 'running' ? t('home.actions.stop') : t('home.actions.start') }}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <!-- <SidebarGroupLabel></SidebarGroupLabel> -->
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in items" :key="item.title">
              <SidebarMenuButton as-child :is-active="route.name === item.name" @click="setOpenMobile(false)">
                <RouterLink :to="{ name: item.name }">
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem v-if="!isMobile">
          <SidebarMenuButton @click="toggleSidebar">
            <component :is="open ? PanelLeftClose : PanelLeftOpen" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
  <SidebarInset class="overflow-y-hidden md:rounded-tl-2xl h-dvh">
    <SidebarTrigger v-if="isMobile" class="fixed bottom-0 left-0 m-2 bg-background" />
    <slot></slot>
  </SidebarInset>
</template>
