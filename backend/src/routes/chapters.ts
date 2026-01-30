import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { ChapterSchema, ChapterUpdateSchema } from '../schemas/chapter.js'
import { adminMiddleware } from '../middleware/auth.js'
import type { Env, Variables } from '../types/index.js'

const chapters = new Hono<{ Bindings: Env; Variables: Variables }>()

chapters.get('/stats', async (c) => {
  const db = c.get('db')
  const stats = await db.getCategoryStats()
  return c.json(stats)
})

chapters.get('', async (c) => {
  const db = c.get('db')
  const category = c.req.query('category')
  const page = parseInt(c.req.query('page') || '1')
  const pageSize = Math.min(parseInt(c.req.query('page_size') || '50'), 100)

  const allChapters = await db.listChapters(category)
  const total = allChapters.length
  const items = allChapters.slice((page - 1) * pageSize, page * pageSize)

  return c.json({ items, total, page, page_size: pageSize })
})

chapters.get('/:chapterId', async (c) => {
  const db = c.get('db')
  const chapterId = c.req.param('chapterId')
  const chapter = await db.getChapterByChapterId(chapterId)

  if (!chapter) {
    return c.json({ error: '章节不存在' }, 404)
  }

  return c.json(chapter)
})

chapters.post('', zValidator('json', ChapterSchema), adminMiddleware, async (c) => {
  const db = c.get('db')
  const data = c.req.valid('json')

  const existing = await db.getChapterByChapterId(data.chapter_id)
  if (existing) {
    return c.json({ error: '章节 ID 已存在' }, 400)
  }

  const chapter = await db.createChapter(data)
  return c.json(chapter, 201)
})

chapters.put('/:id', zValidator('json', ChapterUpdateSchema), adminMiddleware, async (c) => {
  const db = c.get('db')
  const id = c.req.param('id')
  const updates = c.req.valid('json')

  const chapter = await db.updateChapter(id, updates)
  if (!chapter) {
    return c.json({ error: '章节不存在' }, 404)
  }

  return c.json(chapter)
})

chapters.delete('/:id', adminMiddleware, async (c) => {
  const db = c.get('db')
  const id = c.req.param('id')

  const deleted = await db.deleteChapter(id)
  if (!deleted) {
    return c.json({ error: '章节不存在' }, 404)
  }

  return c.json({ message: '章节已删除', success: true })
})

export default chapters
