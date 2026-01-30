<template>
  <article class="chapter-card" @click="handleClick">
    <div class="chapter-card-top">
      <span class="chapter-number">{{ order }}</span>
      <span class="chapter-badge" :class="`badge-${category}`">
        {{ categoryLabel }}
      </span>
    </div>

    <h3 class="chapter-title">{{ title }}</h3>
    <p class="chapter-description">{{ description }}</p>

    <div class="chapter-meta">
      <span class="difficulty" :class="difficulty">
        <span class="difficulty-dot"></span>
        {{ difficultyLabel }}
      </span>

      <span class="chapter-status" v-if="progressStatus">
        <span class="status-dot" :class="progressStatus"></span>
        {{ statusLabel }}
      </span>
    </div>

    <div class="chapter-card-arrow">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 10H15M15 10L10 5M15 10L10 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChapterStore } from '@/stores/chapter'

const props = defineProps<{
  id: string
  order: number
  title: string
  description: string
  category: 'micro' | 'macro' | 'finance'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}>()

const emit = defineEmits<{
  click: []
}>()

const chapterStore = useChapterStore()

const categoryLabel = computed(() => {
  const labels = {
    micro: '微观经济学',
    macro: '宏观经济学',
    finance: '金融学'
  }
  return labels[props.category]
})

const difficultyLabel = computed(() => {
  const labels = {
    beginner: '入门',
    intermediate: '进阶',
    advanced: '高级'
  }
  return labels[props.difficulty]
})

const progressStatus = computed(() => {
  return chapterStore.userProgress[props.id]?.status || null
})

const statusLabel = computed(() => {
  const labels: Record<string, string> = {
    'in-progress': '学习中',
    'completed': '已完成'
  }
  return progressStatus.value ? labels[progressStatus.value] : ''
})

function handleClick() {
  emit('click')
}
</script>

<style scoped>
.chapter-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-8);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-default);
  overflow: hidden;
}

.chapter-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--color-primary);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform var(--duration-normal) var(--ease-default);
}

.chapter-card:hover {
  border-color: var(--color-border);
  box-shadow: var(--shadow-elegant);
  transform: translateY(-4px);
}

.chapter-card:hover::before {
  transform: scaleY(1);
}

.chapter-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chapter-number {
  font-family: var(--font-serif);
  font-size: 3rem;
  font-weight: 300;
  color: var(--color-primary);
  opacity: 0.3;
  line-height: 1;
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

.chapter-title {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.3;
  color: var(--color-text);
}

.chapter-description {
  font-family: var(--font-serif);
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.chapter-meta {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.difficulty {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: var(--radius-full);
}

.difficulty.beginner {
  background: rgba(74, 124, 89, 0.1);
  color: var(--color-success);
}

.difficulty.intermediate {
  background: rgba(196, 136, 58, 0.1);
  color: var(--color-warning);
}

.difficulty.advanced {
  background: rgba(196, 58, 58, 0.1);
  color: var(--color-error);
}

.difficulty-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: currentColor;
}

.chapter-status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-sans);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
}

.status-dot.in-progress {
  background: var(--color-warning);
  animation: pulse 2s infinite;
}

.status-dot.completed {
  background: var(--color-success);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.chapter-card-arrow {
  position: absolute;
  bottom: var(--space-6);
  right: var(--space-6);
  color: var(--color-primary);
  opacity: 0;
  transform: translateX(-8px);
  transition: all var(--duration-normal) var(--ease-default);
}

.chapter-card:hover .chapter-card-arrow {
  opacity: 1;
  transform: translateX(0);
}
</style>
