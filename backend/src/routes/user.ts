import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { ProgressUpdateSchema } from '../schemas/progress.js'
import { authMiddleware } from '../middleware/auth.js'
import type { Env, Variables } from '../types/index.js'

const user = new Hono<{ Bindings: Env; Variables: Variables }>()

user.get('/progress', authMiddleware, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')!
  const progress = await db.getUserProgress(userId)
  return c.json(progress)
})

user.post('/progress', zValidator('json', ProgressUpdateSchema), authMiddleware, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')!
  const { chapter_id, completed, score } = c.req.valid('json')

  const progress = await db.updateProgress(userId, chapter_id, {
    completed,
    score
  })

  return c.json(progress)
})

user.get('/progress/:chapterId', authMiddleware, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')!
  const chapterId = c.req.param('chapterId')!
  const progress = await db.getProgress(userId, chapterId)

  if (!progress) {
    return c.json({ error: '进度不存在' }, 404)
  }

  return c.json(progress)
})

export default user
