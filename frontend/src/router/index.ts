import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    meta: { title: 'EconoLearn - 经济学入门' }
  },
  {
    path: '/learn',
    name: 'learn',
    component: () => import('@/views/Learn.vue'),
    meta: { title: '章节学习' }
  },
  {
    path: '/learn/:id',
    name: 'chapter',
    component: () => import('@/views/Chapter.vue'),
    meta: { title: '章节详情' }
  },
  {
    path: '/explore',
    name: 'explore',
    component: () => import('@/views/Explore.vue'),
    meta: { title: '图表探索' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/Profile.vue'),
    meta: { title: '学习中心' }
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('@/views/Auth.vue'),
    meta: { title: '登录 / 注册' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0, behavior: 'smooth' }
  }
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title as string || 'EconoLearn'
  next()
})

export default router
