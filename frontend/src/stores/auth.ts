import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, type User } from '@/api/auth'
import { useChapterStore } from './chapter'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)

  // Computed
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.is_admin || false)

  // Actions
  function setUser(userData: User) {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function setToken(accessToken: string) {
    token.value = accessToken
    localStorage.setItem('access_token', accessToken)
  }

  function clearAuth() {
    user.value = null
    token.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }

  async function login(username: string, password: string) {
    isLoading.value = true
    try {
      const response = await authApi.login(username, password)
      setToken(response.data.access_token)
      setUser(response.data.user)

      // 登录成功后，加载用户进度数据
      const chapterStore = useChapterStore()
      await chapterStore.fetchUserProgress()

      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.detail || '登录失败'
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  async function register(username: string, email: string, password: string) {
    isLoading.value = true
    try {
      await authApi.register(username, email, password)
      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.detail || '注册失败'
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuth()
      // 清除本地进度数据
      const chapterStore = useChapterStore()
      chapterStore.userProgress = {}
      chapterStore.bookmarks = new Set()
    }
  }

  async function fetchCurrentUser() {
    const savedToken = localStorage.getItem('access_token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser && !user.value) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)

      // 验证 token 是否仍然有效
      try {
        const response = await authApi.getCurrentUser()
        setUser(response.data)

        // Token 有效，加载用户进度数据
        const chapterStore = useChapterStore()
        await chapterStore.fetchUserProgress()
      } catch (error) {
        clearAuth()
      }
    }
  }

  // 初始化
  function init() {
    fetchCurrentUser()
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    clearAuth,
    init
  }
})
