<template>
  <div class="chapter-page">
    <div class="container">
      <!-- Navigation -->
      <div class="chapter-nav">
        <button
          v-if="previousChapter"
          class="nav-button nav-prev"
          @click="navigateToChapter(previousChapter.id)"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 10H5M5 10L10 5M5 10L10 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="nav-content">
            <span class="nav-label">上一章</span>
            <span class="nav-title">{{ previousChapter.title }}</span>
          </div>
        </button>

        <router-link to="/learn" class="nav-back">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L10 10L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          返回目录
        </router-link>

        <button
          v-if="nextChapter"
          class="nav-button nav-next"
          @click="navigateToChapter(nextChapter.id)"
        >
          <div class="nav-content">
            <span class="nav-label">下一章</span>
            <span class="nav-title">{{ nextChapter.title }}</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 10H15M15 10L10 5M15 10L10 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Chapter Content -->
      <article class="chapter-content" v-if="chapter">
        <!-- Chapter Header -->
        <header class="chapter-header">
          <div class="chapter-meta">
            <span class="chapter-badge" :class="`badge-${chapter.category}`">
              {{ categoryLabel }}
            </span>
            <span class="chapter-number">第 {{ chapter.order }} 章</span>
          </div>

          <h1 class="chapter-title">{{ chapter.title }}</h1>
          <p class="chapter-subtitle">{{ chapter.description }}</p>

          <div class="chapter-actions">
            <button
              class="bookmark-btn"
              :class="{ 'bookmarked': isBookmarked }"
              @click="toggleBookmark"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M5 4C5 3.44772 5.44772 3 6 3H14C14.5523 3 15 3.44772 15 4V17L10 14.5L5 17V4Z"/>
              </svg>
              {{ isBookmarked ? '已收藏' : '收藏' }}
            </button>
          </div>
        </header>

        <!-- Simple Explanation -->
        <section class="explanation-section">
          <span class="section-label">🔔 一句话解释</span>
          <div class="simple-explanation">
            {{ chapter.simpleExplanation }}
          </div>
        </section>

        <!-- Main Content -->
        <section class="content-section">
          <span class="section-label">详细说明</span>
          <div class="chapter-text" v-html="formattedContent"></div>
        </section>

        <!-- Examples -->
        <section class="examples-section" v-if="chapter.examples.length > 0">
          <span class="section-label">💡 现实案例</span>
          <ul class="examples-list">
            <li v-for="(example, index) in chapter.examples" :key="index">
              {{ example }}
            </li>
          </ul>
        </section>

        <!-- Related Charts -->
        <section class="charts-section" v-if="hasRelatedCharts">
          <span class="section-label">📊 相关图表</span>
          <div class="related-charts">
            <router-link
              v-for="chartId in chapter.relatedCharts"
              :key="chartId"
              :to="`/explore?chart=${chartId}`"
              class="chart-link"
            >
              <span class="chart-link-icon">📈</span>
              <span class="chart-link-text">{{ getChartTitle(chartId) }}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </router-link>
          </div>
        </section>

        <!-- Mark Complete -->
        <div class="complete-section">
          <button
            class="btn-complete"
            :class="{ 'completed': isCompleted }"
            @click="markComplete"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 5L7.5 14.5L3 10" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ isCompleted ? '已完成' : '标记为已读' }}
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChapterStore } from '@/stores/chapter'
import { chartConfigs } from '@/api/chart'

const route = useRoute()
const router = useRouter()
const chapterStore = useChapterStore()

const chapterId = computed(() => route.params.id as string)
const chapter = computed(() => chapterStore.getChapterById(chapterId.value))
const previousChapter = computed(() => chapterStore.getPreviousChapter(chapterId.value))
const nextChapter = computed(() => chapterStore.getNextChapter(chapterId.value))
const isBookmarked = computed(() => chapterStore.bookmarks.has(chapterId.value))
const isCompleted = computed(() => chapterStore.userProgress[chapterId.value]?.status === 'completed')

const categoryLabel = computed(() => {
  if (!chapter.value) return ''
  const labels = {
    micro: '微观经济学',
    macro: '宏观经济学',
    finance: '金融学'
  }
  return labels[chapter.value.category]
})

const formattedContent = computed(() => {
  if (!chapter.value) return ''
  return chapter.value.content.split('\n\n').map(p => `<p>${p}</p>`).join('')
})

const hasRelatedCharts = computed(() => {
  return chapter.value?.relatedCharts && chapter.value.relatedCharts.length > 0
})

function navigateToChapter(id: string) {
  router.push(`/learn/${id}`)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function toggleBookmark() {
  chapterStore.toggleBookmark(chapterId.value)
}

function markComplete() {
  if (isCompleted.value) return
  chapterStore.completeChapter(chapterId.value)
}

function getChartTitle(chartId: string): string {
  return chartConfigs[chartId]?.title || chartId
}

onMounted(() => {
  if (chapter.value) {
    chapterStore.startChapter(chapterId.value)
  }
})
</script>

<style scoped>
.chapter-page {
  padding: calc(var(--header-height) + var(--space-12)) 0 var(--space-20);
}

/* Navigation */
.chapter-nav {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--space-6);
  margin-bottom: var(--space-12);
  align-items: center;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-default);
  text-align: left;
}

.nav-button:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.nav-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.nav-label {
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.nav-title {
  font-family: var(--font-serif);
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
}

.nav-prev {
  justify-content: flex-start;
}

.nav-next {
  justify-content: flex-end;
}

.nav-next .nav-content {
  align-items: flex-end;
}

.nav-back {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  transition: all var(--duration-fast) var(--ease-default);
}

.nav-back:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

/* Chapter Content */
.chapter-content {
  max-width: 720px;
  margin: 0 auto;
}

.chapter-header {
  margin-bottom: var(--space-12);
}

.chapter-meta {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  margin-bottom: var(--space-6);
}

.chapter-badge {
  padding: var(--space-1) var(--space-3);
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: var(--radius-full);
}

.badge-micro {
  background: rgba(74, 124, 89, 0.12);
  color: var(--color-success);
}

.badge-macro {
  background: rgba(196, 93, 58, 0.12);
  color: var(--color-primary);
}

.badge-finance {
  background: rgba(58, 110, 196, 0.12);
  color: var(--color-info);
}

.chapter-number {
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-tertiary);
}

.chapter-title {
  font-family: var(--font-serif);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 400;
  margin-bottom: var(--space-4);
}

.chapter-subtitle {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.chapter-actions {
  margin-top: var(--space-8);
}

.bookmark-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
}

.bookmark-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.bookmark-btn.bookmarked {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: rgba(196, 93, 58, 0.08);
}

/* Sections */
.explanation-section,
.content-section,
.examples-section,
.charts-section {
  margin-bottom: var(--space-12);
}

.simple-explanation {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  line-height: 1.5;
  font-style: italic;
  color: var(--color-text);
  padding: var(--space-8);
  background: var(--color-surface);
  border-left: 4px solid var(--color-primary);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.chapter-text {
  font-family: var(--font-serif);
  font-size: 1.125rem;
  line-height: 1.8;
  color: var(--color-text-secondary);
}

.chapter-text :deep(p) {
  margin-bottom: var(--space-5);
}

.examples-list {
  list-style: none;
  padding: 0;
}

.examples-list li {
  position: relative;
  padding-left: var(--space-8);
  margin-bottom: var(--space-4);
  font-family: var(--font-serif);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.examples-list li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--color-primary);
}

.related-charts {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.chart-link {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  color: var(--color-text);
  text-decoration: none;
  transition: all var(--duration-normal) var(--ease-default);
}

.chart-link:hover {
  border-color: var(--color-primary);
  transform: translateX(4px);
}

.chart-link-icon {
  font-size: 1.5rem;
}

.chart-link-text {
  flex: 1;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 600;
}

/* Complete Section */
.complete-section {
  padding-top: var(--space-12);
  border-top: 1px solid var(--color-border-light);
}

.btn-complete {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-5);
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-default);
}

.btn-complete:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-complete.completed {
  background: var(--color-success);
  cursor: default;
}

.btn-complete.completed:hover {
  transform: none;
  box-shadow: none;
}

/* Responsive */
@media (max-width: 768px) {
  .chapter-nav {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .nav-back {
    order: -1;
    justify-content: center;
  }

  .simple-explanation {
    font-size: 1.25rem;
    padding: var(--space-6);
  }
}
</style>
