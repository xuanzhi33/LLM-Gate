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

import appIcon from '../../app-icon.png'

import { Home, Package, PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-vue-next';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const { t } = useI18n()
const route = useRoute()

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
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" class="text-xl font-bold">
            <img :src="appIcon" class="size-8 mr-1" />
            <h1 class="truncate">
              {{ t('common.title') }}
            </h1>
          </SidebarMenuButton>
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
  <SidebarInset class="overflow-y-hidden">
    <SidebarTrigger v-if="isMobile" class="fixed bottom-0 left-0 m-2 bg-background" />
    <slot></slot>
  </SidebarInset>
</template>
