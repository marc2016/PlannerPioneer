import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TaskListView from '../views/TaskListView.vue'
import NotesView from '../views/NotesView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/taskList',
      name: 'taskList',
      component: TaskListView,
    },
    {
      path: '/notes',
      name: 'notes',
      component: NotesView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    }
  ],
})

export default router
