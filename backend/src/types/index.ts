export interface Env {
  KV: KVNamespace
  JWT_SECRET: string
  ENVIRONMENT: string
}

export interface Variables {
  db: import('../db/kv.js').KVStore
  userId?: string
}

export interface User {
  id: string
  username: string
  email: string
  password_hash: string
  is_admin: boolean
  created_at: string
}

export interface Chapter {
  id: string
  chapter_id: string
  title: string
  description: string
  content: string
  simple_explanation: string
  category: 'micro' | 'macro' | 'finance'
  difficulty: number
  order: number
  examples: any[]
  related_charts: string[]
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Progress {
  user_id: string
  chapter_id: string
  completed: boolean
  score: number | null
  completed_at: string | null
}

export interface JWTPayload {
  sub: string
  iat: number
  exp: number
}
