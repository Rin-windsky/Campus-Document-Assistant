import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    component: () => import('../views/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chat',
    component: () => import('../views/Chat.vue'),
    meta: { requiresAuth: true, keepAlive: true }
  },
  {
    path: '/docs',
    component: () => import('../views/Docs.vue'),
    meta: { requiresAuth: true, keepAlive: true }
  },
  {
    path: '/service',
    component: () => import('../views/Service.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/service/card-replacement',
    component: () => import('../views/CardReplacement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/service/scholarship',
    component: () => import('../views/ServiceDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/service/major-transfer',
    component: () => import('../views/ServiceDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/service/suspension',
    component: () => import('../views/ServiceDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/service/dorm-repair',
    component: () => import('../views/ServiceDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/service/grade-cert',
    component: () => import('../views/ServiceDetail.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  // 使用 sessionStorage 检查登录状态（避免 Pinia 初始化时序问题）
  const isAuth = !!sessionStorage.getItem('auth_user')

  if (to.meta.requiresAuth && !isAuth) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.path === '/login' && isAuth) {
    return '/'
  }
})

export default router
