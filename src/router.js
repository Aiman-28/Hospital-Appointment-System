import { createRouter, createWebHistory } from 'vue-router'
import { state } from './store'
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import Signup from './views/Signup.vue'
import AppLayout from './layouts/AppLayout.vue'
import Dashboard from './views/Dashboard.vue'
import Appointments from './views/Appointments.vue'
import Patients from './views/Patients.vue'
import Doctors from './views/Doctors.vue'
import Details from './views/Details.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/login', component: Login, meta: { public: true } },
    { path: '/signup', component: Signup, meta: { public: true } },
    {
      path: '/app',
      redirect: '/dashboard',
      component: AppLayout,
      meta: { auth: true },
      children: [
        { path: '/dashboard', component: Dashboard },
        { path: '/appointments', component: Appointments },
        { path: '/patients', component: Patients },
        { path: '/doctors', component: Doctors },
        { path: '/details', redirect: '/dashboard' },
        { path: '/details/:id', component: Details, props: true },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
// Guard: protected routes need a session; login/signup bounce logged-in users to the dashboard.
router.beforeEach((to) => {
  if (to.meta.auth && !state.isLoggedIn) return { path: '/login', query: { redirect: to.fullPath } }
  if (to.meta.public && state.isLoggedIn) return '/dashboard'
})
export default router
