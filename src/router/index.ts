import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

import Dashboard from '@/views/Dashboard/Dashboard.vue'
import Assign from '@/views/Document/Assign.vue'
import Prepare from '@/views/Document/Prepare.vue'
import Sign from '@/views/Document/Sign.vue'
import Show from '@/views/Document/Show.vue'
import AddContact from '@/views/Dashboard/components/AddContact.vue'
import Profil from '@/views/Dashboard/components/Profil.vue'
import Landing from '@/views/Landing/Landing.vue'

export const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: { name: 'dashboard' } },
  {
    path: '/landing',
    name: 'landing',
    component: Landing,
    meta: {
      requiresAuth: false,
      layout:'AuthLayout'
    },
  },
  {
    path: '/login',
    component: () => import('@/views/Auth/Login.vue'),
    name: 'login',
    meta: {
      layout: 'AuthLayout',
    },
  },
  {
    path: '/register',
    component: () => import('@/views/Auth/Register.vue'),
    name: 'register',
    meta: {
      layout: 'AuthLayout',
    },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/assign',
    name: 'assign',
    component: Assign,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/prepare',
    name: 'prepare_document',
    component: Prepare,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/sign',
    name: 'sign_document',
    component: Sign,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/show',
    name: 'view_document',
    component: Show,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/add-contact',
    name: 'add_contact',
    component: AddContact,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/profil',
    name: 'profil',
    component: Profil,
    meta: {
      requiresAuth: true,
    },
  },
 
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('@/views/NotFound.vue'),
  },
]

const router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.matched.some((x) => x.meta.requiresAuth)

  if (requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
