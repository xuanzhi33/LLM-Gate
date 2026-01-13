import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/Home.vue'
import Settings from '@/views/Settings.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
    },
  ],
})

export default router
