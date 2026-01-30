import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api'

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
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface User {
  id: string
  username: string
  email: string
  is_admin: boolean
}

export interface LoginResponse {
  access_token: string
  user: User
}

export interface AuthResponse {
  message: string
  success: boolean
}

export const authApi = {
  // 注册
  register: (username: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', {
      username,
      email,
      password
    }),

  // 登录
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login', {
      username,
      password
    }),

  // 获取当前用户信息
  getCurrentUser: () =>
    api.get<User>('/auth/me'),

  // 登出
  logout: () =>
    api.post<AuthResponse>('/auth/logout')
}
