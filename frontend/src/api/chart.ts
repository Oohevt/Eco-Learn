import type { ChartConfig } from '@/types'

// 图表配置数据
export const chartConfigs: Record<string, ChartConfig> = {
  'supply-demand-curve': {
    id: 'supply-demand-curve',
    title: '供需曲线',
    type: 'line',
    xAxis: {
      name: '数量',
      min: 0,
      max: 100
    },
    yAxis: {
      name: '价格',
      min: 0,
      max: 100
    },
    series: [
      {
        name: '需求曲线',
        data: [[10, 90], [30, 70], [50, 50], [70, 30], [90, 10]],
        color: '#c45d3a'
      },
      {
        name: '供给曲线',
        data: [[10, 10], [30, 30], [50, 50], [70, 70], [90, 90]],
        color: '#4a7c59'
      }
    ]
  },
  'price-equilibrium': {
    id: 'price-equilibrium',
    title: '价格均衡',
    type: 'line',
    xAxis: {
      name: '均衡数量',
      min: 0,
      max: 100,
      step: 1,
      default: 50
    },
    yAxis: {
      name: '均衡价格',
      min: 0,
      max: 100,
      step: 1,
      default: 50
    },
    series: [
      {
        name: '需求曲线',
        data: [[10, 90], [30, 70], [50, 50], [70, 30], [90, 10]],
        color: '#c45d3a'
      },
      {
        name: '供给曲线',
        data: [[10, 10], [30, 30], [50, 50], [70, 70], [90, 90]],
        color: '#4a7c59'
      },
      {
        name: '均衡点',
        data: [[50, 50]],
        color: '#c45d3a'
      }
    ]
  },
  'inflation-chart': {
    id: 'inflation-chart',
    title: '通货膨胀率变化',
    type: 'line',
    xAxis: {
      name: '年份',
      min: 0,
      max: 10,
      step: 1
    },
    yAxis: {
      name: '通胀率 (%)',
      min: -2,
      max: 15,
      step: 0.5
    },
    series: [
      {
        name: '通胀率',
        data: [
          [0, 2.1], [1, 2.5], [2, 3.2], [3, 4.5],
          [4, 8.0], [5, 6.5], [6, 4.2], [7, 2.8],
          [8, 1.5], [9, 0.5], [10, -0.5]
        ],
        color: '#c45d3a'
      }
    ]
  },
  'money-supply': {
    id: 'money-supply',
    title: '货币供应量与利率',
    type: 'line',
    xAxis: {
      name: '货币供应量',
      min: 0,
      max: 100,
      step: 1,
      default: 50
    },
    yAxis: {
      name: '利率',
      min: 0,
      max: 10,
      step: 0.1,
      default: 5
    },
    series: [
      {
        name: '利率曲线',
        data: [[10, 9], [30, 6], [50, 4], [70, 2.5], [90, 1]],
        color: '#c45d3a'
      }
    ]
  },
  'externalities': {
    id: 'externalities',
    title: '外部性成本',
    type: 'line',
    xAxis: {
      name: '产量',
      min: 0,
      max: 100,
      step: 1
    },
    yAxis: {
      name: '成本',
      min: 0,
      max: 100,
      step: 1
    },
    series: [
      {
        name: '私人成本',
        data: [[10, 20], [50, 40], [90, 60]],
        color: '#4a7c59'
      },
      {
        name: '社会成本',
        data: [[10, 35], [50, 65], [90, 95]],
        color: '#c45d3a'
      }
    ]
  }
}
