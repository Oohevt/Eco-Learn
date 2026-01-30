import type { User, Chapter, Progress } from '../types/index.js'

export class KVStore {
  constructor(private kv: KVNamespace) {}

  private generateId(): string {
    return crypto.randomUUID()
  }

  private now(): string {
    return new Date().toISOString()
  }

  async getUserById(id: string): Promise<User | null> {
    const data = await this.kv.get(`user:${id}`, 'json')
    return data as User | null
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const userId = await this.kv.get(`username:${username}`)
    if (!userId) return null
    return this.getUserById(userId)
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const userId = await this.kv.get(`email:${email}`)
    if (!userId) return null
    return this.getUserById(userId)
  }

  async createUser(username: string, email: string, passwordHash: string): Promise<User> {
    const id = this.generateId()
    const user: User = {
      id,
      username,
      email,
      password_hash: passwordHash,
      is_admin: false,
      created_at: this.now()
    }

    await this.kv.put(`user:${id}`, JSON.stringify(user))
    await this.kv.put(`username:${username}`, id)
    await this.kv.put(`email:${email}`, id)

    return user
  }

  async getChapterById(id: string): Promise<Chapter | null> {
    const data = await this.kv.get(`chapter:${id}`, 'json')
    return data as Chapter | null
  }

  async getChapterByChapterId(chapterId: string): Promise<Chapter | null> {
    const id = await this.kv.get(`chapter_id:${chapterId}`)
    if (!id) return null
    return this.getChapterById(id)
  }

  async listChapters(category?: string, publishedOnly = true): Promise<Chapter[]> {
    const list = await this.kv.list({ prefix: 'chapter:' })
    const chapters: Chapter[] = []

    for (const key of list.keys) {
      const chapter = await this.getChapterById(key.name.replace('chapter:', ''))
      if (chapter) {
        if (publishedOnly && !chapter.is_published) continue
        if (category && chapter.category !== category) continue
        chapters.push(chapter)
      }
    }

    return chapters.sort((a, b) => a.order - b.order)
  }

  async createChapter(data: Omit<Chapter, 'id' | 'created_at' | 'updated_at'>): Promise<Chapter> {
    const id = this.generateId()
    const chapter: Chapter = {
      id,
      ...data,
      created_at: this.now(),
      updated_at: this.now()
    }

    await this.kv.put(`chapter:${id}`, JSON.stringify(chapter))
    await this.kv.put(`chapter_id:${data.chapter_id}`, id)

    return chapter
  }

  async updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter | null> {
    const existing = await this.getChapterById(id)
    if (!existing) return null

    const updated: Chapter = {
      ...existing,
      ...updates,
      updated_at: this.now()
    }

    await this.kv.put(`chapter:${id}`, JSON.stringify(updated))

    return updated
  }

  async deleteChapter(id: string): Promise<boolean> {
    const existing = await this.getChapterById(id)
    if (!existing) return false

    await this.kv.delete(`chapter:${id}`)
    await this.kv.delete(`chapter_id:${existing.chapter_id}`)

    return true
  }

  async getProgress(userId: string, chapterId: string): Promise<Progress | null> {
    const data = await this.kv.get(`progress:${userId}:${chapterId}`, 'json')
    return data as Progress | null
  }

  async updateProgress(userId: string, chapterId: string, updates: Partial<Progress>): Promise<Progress> {
    const existing = await this.getProgress(userId, chapterId)
    const now = this.now()

    const progress: Progress = existing
      ? { ...existing, ...updates }
      : {
          user_id: userId,
          chapter_id: chapterId,
          completed: false,
          score: null,
          completed_at: null,
          ...updates
        }

    if (updates.completed && !existing?.completed_at) {
      progress.completed_at = now
    }

    await this.kv.put(`progress:${userId}:${chapterId}`, JSON.stringify(progress))

    return progress
  }

  async getUserProgress(userId: string): Promise<Progress[]> {
    const list = await this.kv.list({ prefix: `progress:${userId}:` })
    const progress: Progress[] = []

    for (const key of list.keys) {
      const data = await this.kv.get(key.name, 'json')
      if (data) {
        progress.push(data as Progress)
      }
    }

    return progress
  }

  async getCategoryStats(): Promise<Array<{ category: string; name: string; count: number }>> {
    const chapters = await this.listChapters(null, true)
    const stats = [
      { category: 'micro', name: '微观经济学', count: 0 },
      { category: 'macro', name: '宏观经济学', count: 0 },
      { category: 'finance', name: '金融学', count: 0 }
    ]

    for (const chapter of chapters) {
      const stat = stats.find(s => s.category === chapter.category)
      if (stat) stat.count++
    }

    return stats
  }
}
