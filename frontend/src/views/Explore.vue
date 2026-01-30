<template>
  <div class="explore-page">
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <span class="section-label">图表探索</span>
        <h1>交互式经济学图表</h1>
        <p class="page-description">
          通过动态图表直观理解经济学概念。调整参数，
          观察曲线变化，让抽象的经济学关系变得可视化。
        </p>
      </header>

      <!-- Chart Grid -->
      <div class="charts-grid">
        <div
          v-for="(config, key) in chartConfigs"
          :key="key"
          class="chart-card"
          :class="{ 'chart-active': activeChart === key }"
          @click="selectChart(key)"
        >
          <div class="chart-preview">
            <svg viewBox="0 0 100 60" class="preview-svg">
              <!-- Simple line preview -->
              <path
                :d="getPreviewPath(config)"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div class="chart-info">
            <h3 class="chart-card-title">{{ config.title }}</h3>
            <p class="chart-card-desc">{{ getChartDescription(key) }}</p>
          </div>
        </div>
      </div>

      <!-- Active Chart Modal -->
      <Transition name="modal">
        <div class="chart-modal" v-if="activeChart" @click.self="closeChart">
          <div class="modal-content">
            <button class="modal-close" @click="closeChart">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <InteractiveChart :config="chartConfigs[activeChart]!" />

            <div class="modal-description">
              <h4>{{ chartConfigs[activeChart]!.title }}</h4>
              <p>{{ getChartDescription(activeChart) }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import InteractiveChart from '@/components/ui/InteractiveChart.vue'
import { chartConfigs } from '@/api/chart'

const route = useRoute()
const activeChart = ref<string | null>(null)

const chartDescriptions: Record<string, string> = {
  'supply-demand-curve': '经典的供需曲线图，展示价格与数量的关系。供给曲线向上倾斜，需求曲线向下倾斜，交点为均衡点。',
  'price-equilibrium': '市场均衡点，供给等于需求时的价格和数量。这是市场自动调节的目标状态。',
  'inflation-chart': '通货膨胀率随时间的变化趋势，观察经济周期中的价格水平波动。',
  'money-supply': '货币供应量与利率的关系，展示央行的货币政策如何影响市场利率。',
  'externalities': '外部性成本分析，对比私人成本与社会成本的差异，理解市场失灵的原因。'
}

function selectChart(key: string) {
  activeChart.value = key
}

function closeChart() {
  activeChart.value = null
}

function getChartDescription(key: string): string {
  return chartDescriptions[key] || ''
}

function getPreviewPath(config: any): string {
  const data = config.series[0]?.data || [[0, 50], [50, 50], [100, 50]]

  // Normalize data to 100x60 viewbox
  const normalized = data.map((p: [number, number]) => {
    const [x, y] = p
    const nx = (x / (config.xAxis?.max || 100)) * 90 + 5
    const ny = 55 - (y / (config.yAxis?.max || 100)) * 50
    return [nx, ny]
  })

  if (normalized.length === 1) {
    return `M ${normalized[0][0]} ${normalized[0][1]}`
  }

  return `M ${normalized.map((p: number[]) => p.join(',')).join(' L ')}`
}

onMounted(() => {
  const chartParam = route.query.chart as string
  if (chartParam && chartConfigs[chartParam]) {
    activeChart.value = chartParam
  }
})
</script>

<style scoped>
.explore-page {
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

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-6);
}

.chart-card {
  display: flex;
  flex-direction: column;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-default);
}

.chart-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-4px);
  box-shadow: var(--shadow-elegant);
}

.chart-preview {
  padding: var(--space-6);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-light);
}

.preview-svg {
  width: 100%;
  height: auto;
  color: var(--color-primary);
}

.chart-info {
  padding: var(--space-6);
}

.chart-card-title {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: var(--space-3);
}

.chart-card-desc {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Modal */
.chart-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: rgba(26, 24, 20, 0.6);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-10);
  box-shadow: var(--shadow-elegant);
}

.modal-close {
  position: absolute;
  top: var(--space-6);
  right: var(--space-6);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
}

.modal-close:hover {
  color: var(--color-text);
  border-color: var(--color-border);
  background: var(--color-surface-elevated);
}

.modal-description {
  margin-top: var(--space-8);
  padding-top: var(--space-8);
  border-top: 1px solid var(--color-border-light);
}

.modal-description h4 {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  margin-bottom: var(--space-4);
}

.modal-description p {
  color: var(--color-text-secondary);
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: all var(--duration-normal) var(--ease-default);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    padding: var(--space-6);
  }
}
</style>
