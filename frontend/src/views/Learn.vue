<template>
  <div class="learn-page">
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <span class="section-label">学习路径</span>
        <h1>经济学基础知识</h1>
        <p class="page-description">
          系统学习经济学核心概念，从供需关系到货币政策，
          用通俗的语言和直观的图表，建立你的经济学思维框架。
        </p>
      </header>

      <!-- Loading State -->
      <div v-if="chapterStore.isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="chapterStore.chapters.length === 0" class="empty-state">
        <span class="empty-icon">📚</span>
        <h3>暂无章节内容</h3>
        <p>请登录后查看学习内容</p>
        <router-link to="/auth" class="btn btn-primary">去登录</router-link>
      </div>

      <!-- Content -->
      <template v-else>
        <!-- Category Tabs -->
        <div class="category-tabs">
          <button
            v-for="category in categories"
            :key="category.key"
            class="tab-button"
            :class="{ 'tab-active': activeCategory === category.key }"
            @click="activeCategory = category.key"
          >
            <span class="tab-icon">{{ category.icon }}</span>
            <span class="tab-label">{{ category.label }}</span>
            <span class="tab-count">{{ category.count }}</span>
          </button>
        </div>

        <!-- Progress Bar -->
        <div class="progress-section" v-if="totalProgress > 0">
          <div class="progress-header">
            <span class="progress-label">学习进度</span>
            <span class="progress-value">{{ completedChapters }}/{{ chapterStore.chapters.length }}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: totalProgress + '%' }"></div>
          </div>
        </div>

        <!-- Chapters Grid -->
        <div class="chapters-grid">
          <ChapterCard
            v-for="chapter in filteredChapters"
            :key="chapter.id"
            :id="chapter.id"
            :order="chapter.order"
            :title="chapter.title"
            :description="chapter.description"
            :category="chapter.category"
            :difficulty="chapter.difficulty"
            @click="navigateToChapter(chapter.id)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChapterStore } from '@/stores/chapter'
import ChapterCard from '@/components/ui/ChapterCard.vue'

const router = useRouter()
const chapterStore = useChapterStore()

const activeCategory = ref<'all' | 'micro' | 'macro' | 'finance'>('all')

const categories = computed(() => {
  const chapters = chapterStore.chapters
  return [
    {
      key: 'all' as const,
      label: '全部',
      icon: '📚',
      count: chapters.length
    },
    {
      key: 'micro' as const,
      label: '微观经济学',
      icon: '🔬',
      count: chapterStore.chaptersByCategory.micro.length
    },
    {
      key: 'macro' as const,
      label: '宏观经济学',
      icon: '🌍',
      count: chapterStore.chaptersByCategory.macro.length
    },
    {
      key: 'finance' as const,
      label: '金融学',
      icon: '💰',
      count: chapterStore.chaptersByCategory.finance.length
    }
  ]
})

const filteredChapters = computed(() => {
  if (activeCategory.value === 'all') {
    return chapterStore.chapters
  }
  return chapterStore.chaptersByCategory[activeCategory.value]
})

const totalProgress = computed(() => chapterStore.totalProgress)
const completedChapters = computed(() => chapterStore.completedChapters)

function navigateToChapter(id: string) {
  router.push(`/learn/${id}`)
}

onMounted(async () => {
  // 确保章节数据已加载
  if (!chapterStore.isInitialized) {
    await chapterStore.initialize()
  }
})
</script>

<style scoped>
.learn-page {
  padding: calc(var(--header-height) + var(--space-12)) 0 var(--space-20);
}

.page-header {
  text-align: center;
  max-width: 640px;
  margin: 0 auto var(--space-16);
}

.page-header h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin-bottom: var(--space-6);
}

.page-description {
  font-size: 1.125rem;
  line-height: 1.7;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-20) 0;
  gap: var(--space-4);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border-light);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: var(--color-text-secondary);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-20) 0;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
}

.empty-state h3 {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  margin-bottom: var(--space-3);
}

.empty-state p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
}

/* Category Tabs */
.category-tabs {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-12);
  flex-wrap: wrap;
  justify-content: center;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
}

.tab-button:hover {
  border-color: var(--color-primary);
}

.tab-active {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.tab-active .tab-icon,
.tab-active .tab-label,
.tab-active .tab-count {
  color: white;
}

.tab-icon {
  font-size: 1.25rem;
}

.tab-label {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.tab-count {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-tertiary);
  background: var(--color-bg);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.tab-active .tab-count {
  background: rgba(255, 255, 255, 0.2);
}

/* Progress Section */
.progress-section {
  max-width: 600px;
  margin: 0 auto var(--space-12);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.progress-label {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.progress-value {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-primary);
}

.progress-track {
  height: 6px;
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

/* Chapters Grid */
.chapters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-6);
}
</style>
