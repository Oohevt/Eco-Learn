import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 自动添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，清除本地存储
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

export interface Chapter {
  id: number
  chapter_id: string
  title: string
  description: string
  content: string
  simple_explanation: string
  examples: string[]
  category: 'micro' | 'macro' | 'finance'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  order: number
  related_charts: string[]
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface ChapterListResponse {
  items: Chapter[]
  total: number
  page: number
  page_size: number
}

export interface CategoryStats {
  category: string
  name: string
  count: number
}

export interface Progress {
  id: number
  user_id: number
  chapter_id: string
  status: 'not-started' | 'in-progress' | 'completed'
  completed_at: string | null
}

export interface Favorite {
  id: number
  user_id: number
  chapter_id: string
  created_at: string
}

export const chapterApi = {
  // 获取章节列表
  getChapters: (params?: { category?: string; page?: number; page_size?: number }) =>
    api.get<ChapterListResponse>('/chapters', { params }),

  // 获取章节详情
  getChapter: (chapterId: string) =>
    api.get<Chapter>(`/chapters/${chapterId}`),

  // 获取分类统计
  getStats: () =>
    api.get<CategoryStats[]>('/chapters/stats')
}

export const progressApi = {
  // 获取用户所有进度
  getAllProgress: () =>
    api.get<Progress[]>('/user/progress'),

  // 获取单个章节进度
  getChapterProgress: (chapterId: string) =>
    api.get<Progress>(`/user/progress/${chapterId}`),

  // 创建或更新进度
  upsertProgress: (chapterId: string, status: 'not-started' | 'in-progress' | 'completed') =>
    api.post<Progress>('/user/progress', {
      chapter_id: chapterId,
      status
    }),

  // 更新进度状态
  updateProgress: (chapterId: string, status: 'not-started' | 'in-progress' | 'completed') =>
    api.put<Progress>(`/user/progress/${chapterId}`, {
      status
    }),

  // 清空所有进度
  clearAllProgress: () =>
    api.delete<{ message: string; success: boolean }>('/user/progress')
}

export const favoriteApi = {
  // 获取收藏列表
  getFavorites: () =>
    api.get<Favorite[]>('/user/favorites'),

  // 添加收藏
  addFavorite: (chapterId: string) =>
    api.post<Favorite>('/user/favorites', {
      chapter_id: chapterId
    }),

  // 取消收藏
  removeFavorite: (chapterId: string) =>
    api.delete(`/user/favorites/${chapterId}`)
}
