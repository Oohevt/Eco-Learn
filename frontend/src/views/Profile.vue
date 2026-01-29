<template>
  <div class="profile-page">
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <span class="section-label">学习中心</span>
        <h1>我的学习进度</h1>
      </header>

      <!-- Stats Overview -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📖</div>
          <div class="stat-content">
            <span class="stat-value">{{ completedChapters }}</span>
            <span class="stat-label">已完成章节</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <span class="stat-value">{{ totalProgress }}%</span>
            <span class="stat-label">总体进度</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <span class="stat-value">{{ bookmarks.size }}</span>
            <span class="stat-label">收藏内容</span>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">学习进度</span>
          <span class="progress-value">{{ completedChapters }}/{{ chapterStore.chapters.length }}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: totalProgress + '%' }"></div>
        </div>
      </div>

      <!-- Bookmarks -->
      <section class="bookmarks-section" v-if="bookmarkList.length > 0">
        <div class="section-header">
          <h2>我的收藏</h2>
        </div>

        <div class="bookmarks-list">
          <router-link
            v-for="chapter in bookmarkList"
            :key="chapter.id"
            :to="`/learn/${chapter.id}`"
            class="bookmark-item"
          >
            <span class="bookmark-number">{{ chapter.order }}</span>
            <div class="bookmark-content">
              <h3 class="bookmark-title">{{ chapter.title }}</h3>
              <p class="bookmark-desc">{{ chapter.description }}</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="bookmark-arrow">
              <path d="M5 10H15M15 10L10 5M15 10L10 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </router-link>
        </div>
      </section>

      <!-- All Chapters Progress -->
      <section class="chapters-progress">
        <div class="section-header">
          <h2>全部章节</h2>
        </div>

        <div class="progress-list">
          <div
            v-for="chapter in chapterStore.chapters"
            :key="chapter.id"
            class="progress-item"
            :class="`status-${getStatus(chapter.id)}`"
          >
            <div class="progress-item-left">
              <span class="progress-number">{{ chapter.order }}</span>
              <div class="progress-info">
                <h3 class="progress-title">{{ chapter.title }}</h3>
                <span class="progress-status">{{ getStatusLabel(chapter.id) }}</span>
              </div>
            </div>

            <router-link
              v-if="getStatus(chapter.id) !== 'not-started'"
              :to="`/learn/${chapter.id}`"
              class="progress-link"
            >
              复习
            </router-link>
            <router-link
              v-else
              :to="`/learn/${chapter.id}`"
              class="progress-link progress-link-primary"
            >
              开始学习
            </router-link>
          </div>
        </div>
      </section>

      <!-- Motivational Quote -->
      <div class="quote-card" v-if="totalProgress === 100">
        <span class="quote-icon">🎉</span>
        <h3>恭喜你完成了所有章节！</h3>
        <p>你已经建立了坚实的经济学基础，继续保持学习的好奇心。</p>
      </div>
      <div class="quote-card" v-else-if="totalProgress > 50">
        <span class="quote-icon">💪</span>
        <h3>已经过半了！</h3>
        <p>坚持就是胜利，继续加油完成剩余章节。</p>
      </div>
      <div class="quote-card" v-else-if="totalProgress > 0">
        <span class="quote-icon">🚀</span>
        <h3>良好的开始！</h3>
        <p>千里之行，始于足下。继续探索经济学的奥秘。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChapterStore } from '@/stores/chapter'

const chapterStore = useChapterStore()

const completedChapters = computed(() => chapterStore.completedChapters)
const totalProgress = computed(() => chapterStore.totalProgress)
const bookmarks = computed(() => chapterStore.bookmarks)

const bookmarkList = computed(() => {
  return Array.from(bookmarks.value)
    .map(id => chapterStore.getChapterById(id))
    .filter(Boolean)
    .sort((a, b) => a!.order - b!.order)
})

function getStatus(chapterId: string) {
  return chapterStore.userProgress[chapterId]?.status || 'not-started'
}

function getStatusLabel(chapterId: string): string {
  const status = getStatus(chapterId)
  const labels = {
    'not-started': '未开始',
    'in-progress': '学习中',
    'completed': '已完成'
  }
  return labels[status]
}
</script>

<style scoped>
.profile-page {
  padding: calc(var(--header-height) + var(--space-12)) 0 var(--space-20);
}

.page-header {
  text-align: center;
  margin-bottom: var(--space-12);
}

.page-header h1 {
  font-size: clamp(2rem, 4vw, 2.5rem);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-12);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-6);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.stat-value {
  font-family: var(--font-sans);
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

/* Progress Section */
.progress-section {
  max-width: 600px;
  margin: 0 auto var(--space-16);
  padding: var(--space-6);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.progress-label {
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
}

.progress-value {
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--color-primary);
}

.progress-track {
  height: 8px;
  background: var(--color-border-light);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, var(--color-primary), var(--color-primary-light));
  border-radius: var(--radius-full);
  transition: width var(--duration-slow) var(--ease-default);
}

/* Section Header */
.section-header {
  margin-bottom: var(--space-8);
}

.section-header h2 {
  font-family: var(--font-serif);
  font-size: 1.75rem;
  font-weight: 500;
}

/* Bookmarks */
.bookmarks-section {
  margin-bottom: var(--space-16);
}

.bookmarks-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.bookmark-item {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-6);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all var(--duration-normal) var(--ease-default);
}

.bookmark-item:hover {
  border-color: var(--color-primary);
  transform: translateX(4px);
}

.bookmark-number {
  font-family: var(--font-serif);
  font-size: 2rem;
  font-weight: 300;
  color: var(--color-primary);
  opacity: 0.4;
  min-width: 40px;
}

.bookmark-content {
  flex: 1;
}

.bookmark-title {
  font-family: var(--font-serif);
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: var(--space-1);
}

.bookmark-desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.bookmark-arrow {
  color: var(--color-primary);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-default);
}

.bookmark-item:hover .bookmark-arrow {
  opacity: 1;
}

/* Progress List */
.chapters-progress {
  margin-bottom: var(--space-16);
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.progress-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  transition: all var(--duration-normal) var(--ease-default);
}

.progress-item-left {
  display: flex;
  align-items: center;
  gap: var(--space-5);
}

.progress-number {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-text-tertiary);
  min-width: 30px;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.progress-title {
  font-family: var(--font-serif);
  font-size: 1rem;
  font-weight: 500;
}

.progress-status {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

.progress-item.status-completed {
  border-left: 3px solid var(--color-success);
}

.progress-item.status-in-progress {
  border-left: 3px solid var(--color-warning);
}

.progress-item.status-completed .progress-status {
  color: var(--color-success);
}

.progress-item.status-in-progress .progress-status {
  color: var(--color-warning);
}

.progress-link {
  padding: var(--space-2) var(--space-4);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  text-decoration: none;
  transition: all var(--duration-fast) var(--ease-default);
}

.progress-link:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.progress-link-primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.progress-link-primary:hover {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
}

/* Quote Card */
.quote-card {
  text-align: center;
  padding: var(--space-10);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
}

.quote-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: var(--space-6);
}

.quote-card h3 {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  margin-bottom: var(--space-4);
}

.quote-card p {
  color: var(--color-text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .progress-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .progress-link {
    align-self: flex-end;
  }
}
</style>
