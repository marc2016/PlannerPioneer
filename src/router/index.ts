import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PersonsView from '../views/PersonsView.vue'
import SettingsView from '../views/SettingsView.vue'
import PlannerView from '../views/PlannerView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/personsView',
      name: 'personsView',
      component: PersonsView,
    },
    {
      path: '/plannerView',
      name: 'plannerView',
      component: PlannerView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    }
  ],
})

export default router
