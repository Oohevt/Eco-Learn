export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ChartConfig {
  id: string
  title: string
  type: 'line' | 'bar' | 'scatter' | 'custom'
  xAxis?: {
    name: string
    min?: number
    max?: number
    step?: number
    default?: number
  }
  yAxis?: {
    name: string
    min?: number
    max?: number
    step?: number
    default?: number
  }
  series: {
    name: string
    data: number[][]
    color?: string
  }[]
}
