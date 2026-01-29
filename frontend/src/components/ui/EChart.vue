<template>
  <div ref="chartRef" class="e-chart" :style="{ height: height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const props = defineProps<{
  option: EChartsOption
  height?: string
  theme?: string | object
}>()

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

function initChart() {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value, props.theme)
  chartInstance.setOption(props.option)
}

function resizeChart() {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

watch(() => props.option, (newOption) => {
  chartInstance?.setOption(newOption, { notMerge: true })
}, { deep: true })

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance?.dispose()
})

defineExpose({
  resize: resizeChart
})
</script>

<style scoped>
.e-chart {
  width: 100%;
}
</style>
