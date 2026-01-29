<template>
  <div class="interactive-chart">
    <div class="chart-header">
      <h4 class="chart-title">{{ config.title }}</h4>
      <!-- 只在价格均衡图表显示控制滑块 -->
      <div class="chart-controls" v-if="config.id === 'price-equilibrium' && (config.xAxis || config.yAxis)">
        <div class="control-group" v-if="config.xAxis">
          <label>{{ config.xAxis.name }}</label>
          <input
            type="range"
            :min="config.xAxis.min"
            :max="config.xAxis.max"
            :step="config.xAxis.step || 1"
            :value="xValue"
            @input="handleXChange"
          >
          <span class="value-display">{{ xValue }}</span>
        </div>
        <div class="control-group" v-if="config.yAxis">
          <label>{{ config.yAxis.name }}</label>
          <input
            type="range"
            :min="config.yAxis.min"
            :max="config.yAxis.max"
            :step="config.yAxis.step || 1"
            :value="yValue"
            @input="handleYChange"
          >
          <span class="value-display">{{ yValue }}</span>
        </div>
      </div>
    </div>

    <EChart :option="chartOption" height="400px" />

    <div class="chart-insight" v-if="insight">
      <span class="insight-icon">💡</span>
      <p class="insight-text">{{ insight }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import EChart from './EChart.vue'
import type { ChartConfig } from '@/types'

const props = defineProps<{
  config: ChartConfig
}>()

const xValue = ref(props.config.xAxis?.default ?? 50)
const yValue = ref(props.config.yAxis?.default ?? 50)

// 根据均衡点计算动态供需曲线
const dynamicCurves = computed(() => {
  if (props.config.id !== 'price-equilibrium') {
    return null
  }

  const eqX = xValue.value  // 均衡数量
  const eqY = yValue.value  // 均衡价格

  // 生成数据点：数量从 0 到 100，间隔 10
  const points = []
  for (let q = 0; q <= 100; q += 10) {
    points.push(q)
  }

  // 需求曲线：P = (eqY + eqX) - Q
  // 当 Q = eqX 时，P = eqY（经过均衡点）
  const demandCurve = points.map(q => [q, Math.max(0, (eqY + eqX) - q)])

  // 供给曲线：P = (eqY - eqX) + Q
  // 当 Q = eqX 时，P = eqY（经过均衡点）
  const supplyCurve = points.map(q => [q, Math.max(0, (eqY - eqX) + q)])

  return { demandCurve, supplyCurve }
})

const chartOption = computed(() => {
  const baseOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'var(--color-surface-elevated)',
      borderColor: 'var(--color-border)',
      textStyle: {
        color: 'var(--color-text)'
      }
    },
    xAxis: {
      type: 'value',
      name: props.config.xAxis?.name || '',
      nameTextStyle: {
        color: 'var(--color-text-secondary)'
      },
      axisLine: {
        lineStyle: { color: 'var(--color-border)' }
      },
      axisLabel: {
        color: 'var(--color-text-secondary)'
      },
      splitLine: {
        lineStyle: { color: 'var(--color-border-light)', type: 'dashed' }
      }
    },
    yAxis: {
      type: 'value',
      name: props.config.yAxis?.name || '',
      nameTextStyle: {
        color: 'var(--color-text-secondary)'
      },
      axisLine: {
        lineStyle: { color: 'var(--color-border)' }
      },
      axisLabel: {
        color: 'var(--color-text-secondary)'
      },
      splitLine: {
        lineStyle: { color: 'var(--color-border-light)', type: 'dashed' }
      }
    },
    series: props.config.series.map(s => {
      // 价格均衡图表使用动态曲线
      if (props.config.id === 'price-equilibrium' && dynamicCurves.value) {
        if (s.name === '需求曲线') {
          return {
            name: s.name,
            type: 'line',
            data: dynamicCurves.value.demandCurve,
            smooth: true,
            lineStyle: { width: 3, color: s.color },
            itemStyle: { color: s.color },
            symbolSize: 6
          }
        } else if (s.name === '供给曲线') {
          return {
            name: s.name,
            type: 'line',
            data: dynamicCurves.value.supplyCurve,
            smooth: true,
            lineStyle: { width: 3, color: s.color },
            itemStyle: { color: s.color },
            symbolSize: 6
          }
        } else if (s.name === '均衡点') {
          return {
            name: s.name,
            type: 'scatter',
            data: [[xValue.value, yValue.value]],
            symbolSize: 16,
            itemStyle: { color: s.color },
            markLine: {
              silent: true,
              symbol: 'none',
              lineStyle: { color: 'var(--color-border)', type: 'dashed', width: 1 },
              data: [
                { xAxis: xValue.value },
                { yAxis: yValue.value }
              ]
            }
          }
        }
      }

      // 其他图表使用原始数据
      return {
        name: s.name,
        type: props.config.type === 'custom' ? 'scatter' : props.config.type,
        data: s.data,
        smooth: true,
        lineStyle: { width: 3, color: s.color || 'var(--color-primary)' },
        itemStyle: { color: s.color || 'var(--color-primary)' },
        symbolSize: props.config.type === 'custom' ? 20 : 6
      }
    }),
    grid: {
      left: '60px',
      right: '40px',
      top: '40px',
      bottom: '60px'
    }
  }

  return baseOption
})

const insight = computed(() => {
  if (props.config.id === 'supply-demand-curve') {
    return `当价格变化时，供需关系会自动调节。价格越高，供给越多但需求越少。`
  }
  if (props.config.id === 'price-equilibrium') {
    const q = xValue.value
    const p = yValue.value
    return `当均衡数量为 ${q}、均衡价格为 ${p} 时，市场处于出清状态。观察曲线如何围绕新均衡点重新定位。`
  }
  return ''
})

function handleXChange(e: Event) {
  xValue.value = Number((e.target as HTMLInputElement).value)
}

function handleYChange(e: Event) {
  yValue.value = Number((e.target as HTMLInputElement).value)
}
</script>

<style scoped>
.interactive-chart {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.chart-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.chart-title {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--color-text);
}

.chart-controls {
  display: flex;
  gap: var(--space-8);
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 200px;
}

.control-group label {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.control-group input[type="range"] {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--color-border-light);
  border-radius: var(--radius-full);
  outline: none;
}

.control-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-default);
}

.control-group input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.value-display {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
  min-width: 40px;
  text-align: right;
}

.chart-insight {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-5);
  background: rgba(196, 93, 58, 0.06);
  border-left: 3px solid var(--color-primary);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.insight-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.insight-text {
  font-family: var(--font-serif);
  font-size: 1rem;
  color: var(--color-text);
  margin: 0;
}
</style>
