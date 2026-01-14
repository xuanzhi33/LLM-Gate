import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/Home.vue'
import Settings from '@/views/Settings.vue'
import Models from '@/views/Models.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/models',
      name: 'models',
      component: Models,
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
    },
  ],
})

export default router
