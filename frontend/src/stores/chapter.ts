import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { chapterApi, progressApi, favoriteApi, type Chapter as ApiChapter } from '@/api/chapter'
import { useAuthStore } from './auth'

export interface Chapter {
  id: string
  title: string
  description: string
  content: string
  simpleExplanation: string
  examples: string[]
  category: 'micro' | 'macro' | 'finance'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  order: number
  relatedCharts?: string[]
}

export interface UserProgress {
  chapterId: string
  status: 'not-started' | 'in-progress' | 'completed'
  completedAt?: Date
}

// 转换后端数据格式到前端格式
function transformChapter(apiChapter: ApiChapter): Chapter {
  return {
    id: apiChapter.chapter_id,
    title: apiChapter.title,
    description: apiChapter.description,
    content: apiChapter.content,
    simpleExplanation: apiChapter.simple_explanation,
    examples: apiChapter.examples,
    category: apiChapter.category,
    difficulty: apiChapter.difficulty,
    order: apiChapter.order,
    relatedCharts: apiChapter.related_charts
  }
}

export const useChapterStore = defineStore('chapter', () => {
  // State
  const chapters = ref<Chapter[]>([])
  const currentChapter = ref<Chapter | null>(null)
  const userProgress = ref<Record<string, UserProgress>>({})
  const bookmarks = ref<Set<string>>(new Set())
  const isLoading = ref(false)
  const isInitialized = ref(false)

  // Computed
  const chaptersByCategory = computed(() => {
    return {
      micro: chapters.value.filter(c => c.category === 'micro'),
      macro: chapters.value.filter(c => c.category === 'macro'),
      finance: chapters.value.filter(c => c.category === 'finance')
    }
  })

  const completedChapters = computed(() => {
    return Object.values(userProgress.value)
      .filter(p => p.status === 'completed')
      .length
  })

  const totalProgress = computed(() => {
    if (chapters.value.length === 0) return 0
    return Math.round((completedChapters.value / chapters.value.length) * 100)
  })

  // Actions
  async function fetchChapters() {
    // 如果已有数据且不为空，直接返回（缓存）
    if (chapters.value.length > 0 && !isLoading.value) {
      return
    }

    if (isLoading.value) return

    isLoading.value = true
    try {
      const response = await chapterApi.getChapters()
      chapters.value = response.data.items.map(transformChapter)
      isInitialized.value = true
    } catch (error) {
      console.error('Failed to fetch chapters:', error)
      // 如果未登录，使用空数组
      chapters.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserProgress() {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      // 未登录，清空进度
      userProgress.value = {}
      bookmarks.value = new Set()
      return
    }

    try {
      // 获取学习进度
      const progressResponse = await progressApi.getAllProgress()
      const progressMap: Record<string, UserProgress> = {}
      for (const p of progressResponse.data) {
        progressMap[p.chapter_id] = {
          chapterId: p.chapter_id,
          status: p.status,
          completedAt: p.completed_at ? new Date(p.completed_at) : undefined
        }
      }
      userProgress.value = progressMap

      // 获取收藏列表
      const favResponse = await favoriteApi.getFavorites()
      bookmarks.value = new Set(favResponse.data.map(f => f.chapter_id))
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  async function initialize() {
    if (isInitialized.value) return

    isInitialized.value = true
    await fetchChapters()
    await fetchUserProgress()
  }

  function getChapterById(id: string) {
    return chapters.value.find(c => c.id === id)
  }

  function getChapterByOrder(order: number) {
    return chapters.value.find(c => c.order === order)
  }

  function getNextChapter(currentId: string) {
    const current = getChapterById(currentId)
    if (!current) return null
    return getChapterByOrder(current.order + 1)
  }

  function getPreviousChapter(currentId: string) {
    const current = getChapterById(currentId)
    if (!current) return null
    return getChapterByOrder(current.order - 1)
  }

  async function startChapter(chapterId: string) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      // 未登录，只更新本地状态
      userProgress.value[chapterId] = {
        chapterId,
        status: 'in-progress'
      }
      currentChapter.value = getChapterById(chapterId) || null
      return
    }

    // 已登录，同步到后端
    try {
      await progressApi.upsertProgress(chapterId, 'in-progress')
      userProgress.value[chapterId] = {
        chapterId,
        status: 'in-progress'
      }
      currentChapter.value = getChapterById(chapterId) || null
    } catch (error) {
      console.error('Failed to start chapter:', error)
    }
  }

  async function completeChapter(chapterId: string) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      // 未登录，只更新本地状态
      userProgress.value[chapterId] = {
        chapterId,
        status: 'completed',
        completedAt: new Date()
      }
      return
    }

    // 已登录，同步到后端
    try {
      await progressApi.upsertProgress(chapterId, 'completed')
      userProgress.value[chapterId] = {
        chapterId,
        status: 'completed',
        completedAt: new Date()
      }
    } catch (error) {
      console.error('Failed to complete chapter:', error)
    }
  }

  async function toggleBookmark(chapterId: string) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      // 未登录，只更新本地状态
      if (bookmarks.value.has(chapterId)) {
        bookmarks.value.delete(chapterId)
      } else {
        bookmarks.value.add(chapterId)
      }
      return
    }

    // 已登录，同步到后端
    try {
      if (bookmarks.value.has(chapterId)) {
        await favoriteApi.removeFavorite(chapterId)
        bookmarks.value.delete(chapterId)
      } else {
        await favoriteApi.addFavorite(chapterId)
        bookmarks.value.add(chapterId)
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
    }
  }

  // 获取章节进度状态
  function getChapterStatus(chapterId: string): 'not-started' | 'in-progress' | 'completed' {
    return userProgress.value[chapterId]?.status || 'not-started'
  }

  async function clearAllProgress() {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      // 未登录，只清空本地状态
      userProgress.value = {}
      return
    }

    // 已登录，同步到后端
    try {
      await progressApi.clearAllProgress()
      userProgress.value = {}
    } catch (error) {
      console.error('Failed to clear progress:', error)
      throw error
    }
  }

  return {
    chapters,
    currentChapter,
    userProgress,
    bookmarks,
    isLoading,
    isInitialized,
    chaptersByCategory,
    completedChapters,
    totalProgress,
    initialize,
    fetchChapters,
    fetchUserProgress,
    getChapterById,
    getChapterByOrder,
    getNextChapter,
    getPreviousChapter,
    startChapter,
    completeChapter,
    toggleBookmark,
    getChapterStatus,
    clearAllProgress
  }
})
