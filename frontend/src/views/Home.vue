<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <span class="section-label">经济学入门</span>
          <h1 class="hero-title">
            <span class="hero-title-main">理解世界运行的</span>
            <span class="hero-title-accent">底层逻辑</span>
          </h1>
          <p class="hero-description drop-cap">
            经济学不是复杂的数学公式，而是理解人类选择和资源分配的思维方式。
            从供需关系到通货膨胀，从市场机制到政策影响，
            用通俗的语言和直观的图表，带你掌握经济学的核心概念。
          </p>
          <div class="hero-actions">
            <router-link to="/learn" class="btn btn-primary">
              开始学习
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </router-link>
            <router-link to="/explore" class="btn btn-secondary">
              探索图表
            </router-link>
          </div>
        </div>

        <!-- Featured Equation -->
        <div class="hero-equation">
          <div class="equation-inner">
            <div class="equation-symbol">∑</div>
            <div class="equation-content">
              <div class="equation-label">经济学第一原理</div>
              <div class="equation-text">资源稀缺性迫使人们做出选择</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <div class="section-header">
          <span class="section-label">为什么选择 EconoLearn</span>
          <h2>让经济学变得易懂</h2>
        </div>

        <div class="grid grid-3">
          <div class="feature-card" v-for="(feature, index) in features" :key="index">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Chapters Preview -->
    <section class="chapters-preview">
      <div class="container">
        <div class="section-header">
          <span class="section-label">学习路径</span>
          <h2>核心章节</h2>
        </div>

        <div class="chapters-grid">
          <ChapterCard
            v-for="chapter in previewChapters"
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

        <div class="preview-actions">
          <router-link to="/learn" class="btn btn-ghost">
            查看全部章节
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Quote Section -->
    <section class="quote-section">
      <div class="container container-narrow">
        <blockquote>
          "经济学是一门研究人在不确定性中如何选择的科学。"
          <cite>— 加里·贝克尔，诺贝尔经济学奖得主</cite>
        </blockquote>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-card">
          <h2>准备好开始了吗？</h2>
          <p>每天15分钟，轻松掌握经济学核心概念</p>
          <router-link to="/learn" class="btn btn-primary">
            立即开始
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChapterStore } from '@/stores/chapter'
import ChapterCard from '@/components/ui/ChapterCard.vue'

const router = useRouter()
const chapterStore = useChapterStore()

const features = [
  {
    icon: '📖',
    title: '通俗讲解',
    description: '避开复杂公式，用生活化的语言解释经济学概念'
  },
  {
    icon: '📊',
    title: '可视化图表',
    description: '通过交互式图表直观理解经济关系和变化趋势'
  },
  {
    icon: '🎯',
    title: '实战案例',
    description: '结合现实案例，理解经济学在日常生活中的应用'
  }
]

const previewChapters = computed(() => {
  return chapterStore.chapters.slice(0, 3)
})

function navigateToChapter(id: string) {
  router.push(`/learn/${id}`)
}
</script>

<style scoped>
/* Hero Section */
.hero {
  padding: calc(var(--header-height) + var(--space-20)) 0 var(--space-24);
  min-height: 90vh;
  display: flex;
  align-items: center;
}

.hero-content {
  max-width: 720px;
}

.hero-title {
  margin: var(--space-6) 0;
  line-height: 1.1;
}

.hero-title-main {
  display: block;
  color: var(--color-text);
}

.hero-title-accent {
  display: block;
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--color-primary);
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.8;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-8);
}

.hero-actions {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.hero-equation {
  position: absolute;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
}

.equation-inner {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-8);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-elegant);
}

.equation-symbol {
  font-family: var(--font-serif);
  font-size: 4rem;
  font-weight: 300;
  color: var(--color-primary);
  line-height: 1;
}

.equation-label {
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-primary);
  margin-bottom: var(--space-2);
}

.equation-text {
  font-family: var(--font-serif);
  font-size: 1.125rem;
  color: var(--color-text);
}

/* Features Section */
.features {
  padding: var(--space-24) 0;
}

.section-header {
  text-align: center;
  margin-bottom: var(--space-16);
}

.section-header h2 {
  font-size: 2.5rem;
  margin-top: var(--space-4);
}

.feature-card {
  padding: var(--space-8);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  text-align: center;
  transition: all var(--duration-normal) var(--ease-default);
}

.feature-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-4px);
  box-shadow: var(--shadow-elegant);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: var(--space-4);
}

.feature-title {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: var(--space-3);
}

.feature-description {
  font-size: 1rem;
  margin: 0;
}

/* Chapters Preview */
.chapters-preview {
  padding: var(--space-24) 0;
  background: var(--color-surface);
}

.chapters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-10);
}

.preview-actions {
  display: flex;
  justify-content: center;
}

/* Quote Section */
.quote-section {
  padding: var(--space-24) 0;
}

/* CTA Section */
.cta-section {
  padding: var(--space-24) 0;
}

.cta-card {
  position: relative;
  text-align: center;
  padding: var(--space-16);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.cta-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(to right, var(--color-primary), var(--color-primary-light));
}

.cta-card h2 {
  font-family: var(--font-serif);
  font-size: 2rem;
  margin-bottom: var(--space-4);
}

.cta-card p {
  font-size: 1.125rem;
  margin-bottom: var(--space-8);
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    padding-top: calc(var(--header-height) + var(--space-12));
    min-height: auto;
  }

  .hero-equation {
    position: static;
    transform: none;
    margin-top: var(--space-10);
  }

  .equation-inner {
    flex-direction: column;
    text-align: center;
  }

  .chapters-grid {
    grid-template-columns: 1fr;
  }
}
</style>
