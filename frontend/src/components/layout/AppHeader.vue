<template>
  <header class="header" :class="{ 'header-scrolled': scrolled }">
    <div class="container">
      <div class="header-inner">
        <router-link to="/" class="logo">
          <span class="logo-symbol">∑</span>
          <span class="logo-text">EconoLearn</span>
        </router-link>

        <nav class="nav">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-link"
            :class="{ 'nav-link-active': isActive(item.path) }"
          >
            <span class="nav-label">{{ item.label }}</span>
            <span class="nav-indicator" v-if="isActive(item.path)"></span>
          </router-link>

          <!-- 登录按钮放在"我的"右边 -->
          <template v-if="authStore.isAuthenticated">
            <button class="nav-link nav-action" @click="handleLogout">
              <span class="nav-label">登出</span>
            </button>
          </template>
          <router-link v-else to="/auth" class="nav-link nav-action">
            <span class="nav-label">登录</span>
          </router-link>
        </nav>

        <div class="header-actions">
          <!-- 已登录用户信息 -->
          <template v-if="authStore.isAuthenticated">
            <div class="user-info">
              <span class="user-name">{{ authStore.user?.username }}</span>
              <!-- 清空进度按钮 -->
              <button class="btn-clear" @click="showClearConfirm = true" title="清空学习进度">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </template>

          <!-- 进度指示器 - 已登录用户始终显示 -->
          <div
            class="progress-indicator"
            v-if="authStore.isAuthenticated"
          >
            <svg class="progress-ring" viewBox="0 0 40 40">
              <circle class="progress-ring-bg" cx="20" cy="20" r="16"/>
              <circle
                class="progress-ring-fill"
                cx="20"
                cy="20"
                r="16"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="strokeDashoffset"
              />
            </svg>
            <span class="progress-text">{{ totalProgress }}%</span>
          </div>
        </div>

        <!-- 清空确认对话框 -->
        <div v-if="showClearConfirm" class="modal-overlay" @click.self="showClearConfirm = false">
          <div class="modal-content">
            <h3>清空学习进度</h3>
            <p>确定要清空所有学习进度吗？此操作无法撤销。</p>
            <div class="modal-actions">
              <button class="btn-cancel" @click="showClearConfirm = false">取消</button>
              <button class="btn-confirm" @click="handleClearProgress">确定清空</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { useChapterStore } from '@/stores/chapter'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const chapterStore = useChapterStore()
const authStore = useAuthStore()

const scrolled = ref(false)
const showClearConfirm = ref(false)
const totalProgress = computed(() => chapterStore.totalProgress)

// 圆形进度环计算
const radius = 16
const circumference = 2 * Math.PI * radius
const strokeDashoffset = computed(() => {
  const progress = totalProgress.value / 100
  return circumference * (1 - progress)
})

const navItems = [
  { path: '/', label: '首页' },
  { path: '/learn', label: '学习' },
  { path: '/explore', label: '探索' },
  { path: '/profile', label: '我的' }
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}

async function handleClearProgress() {
  try {
    await chapterStore.clearAllProgress()
    showClearConfirm.value = false
  } catch (error) {
    console.error('清空进度失败:', error)
    alert('清空进度失败，请稍后重试')
  }
}

function handleScroll() {
  scrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  z-index: 100;
  transition: all var(--duration-normal) var(--ease-default);
}

.header-scrolled {
  background: rgba(247, 244, 239, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 0 var(--color-border-light);
}

.header-inner {
  display: flex;
  align-items: center;
  height: 100%;
  gap: var(--space-12);
}

/* Logo */
.logo {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  text-decoration: none;
}

.logo-symbol {
  font-family: var(--font-serif);
  font-size: 1.75rem;
  font-weight: 300;
  color: var(--color-primary);
  line-height: 1;
}

.logo-text {
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
}

/* Navigation */
.nav {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
}

.nav-link {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-default);
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.nav-link:hover {
  color: var(--color-text);
}

.nav-link-active {
  color: var(--color-text);
}

.nav-link.nav-action {
  color: var(--color-primary);
}

.nav-link.nav-action:hover {
  color: var(--color-primary-dark);
}

.nav-label {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.nav-indicator {
  position: absolute;
  bottom: -4px;
  width: 4px;
  height: 4px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.user-name {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.btn-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  color: var(--color-text-tertiary);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
}

.btn-clear:hover {
  color: var(--color-error);
  background: var(--color-bg);
}

.btn-clear svg {
  width: 14px;
  height: 14px;
}

/* Progress Indicator */
.progress-indicator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring-bg {
  fill: none;
  stroke: var(--color-border);
  stroke-width: 3;
}

.progress-ring-fill {
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.progress-text {
  position: absolute;
  font-family: var(--font-sans);
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--color-text);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: var(--color-surface);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  min-width: 320px;
  max-width: 90%;
  animation: slideUp 0.2s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content h3 {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  margin-bottom: var(--space-3);
  color: var(--color-text);
}

.modal-content p {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-5);
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}

.btn-cancel,
.btn-confirm {
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
}

.btn-cancel {
  color: var(--color-text-secondary);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
}

.btn-cancel:hover {
  color: var(--color-text);
  border-color: var(--color-text);
}

.btn-confirm {
  color: white;
  background: var(--color-error);
  border: 1px solid var(--color-error);
}

.btn-confirm:hover {
  background: #d32f2f;
  border-color: #d32f2f;
}

@media (max-width: 768px) {
  .nav {
    display: none;
  }

  .user-name {
    display: none;
  }

  .header-inner {
    justify-content: space-between;
  }
}
</style>
