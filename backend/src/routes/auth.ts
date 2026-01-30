import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { RegisterSchema, LoginSchema } from '../schemas/auth.js'
import { hashPassword, verifyPassword, createToken } from '../utils/jwt.js'
import { authMiddleware } from '../middleware/auth.js'

const auth = new Hono<{ Bindings: any }>()

auth.post('/register', zValidator('json', RegisterSchema), async (c) => {
  const db = c.get('db')
  const { username, email, password } = c.req.valid('json')

  const existingUser = await db.getUserByUsername(username) || await db.getUserByEmail(email)
  if (existingUser) {
    return c.json({ error: '用户名或邮箱已存在' }, 400)
  }

  const passwordHash = await hashPassword(password)
  const user = await db.createUser(username, email, passwordHash)

  return c.json({ message: `用户 ${user.username} 注册成功`, success: true }, 201)
})

auth.post('/login', zValidator('json', LoginSchema), async (c) => {
  const db = c.get('db')
  const { username, password } = c.req.valid('json')

  const user = await db.getUserByUsername(username)
  if (!user) {
    return c.json({ error: '用户名或密码错误' }, 401)
  }

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    return c.json({ error: '用户名或密码错误' }, 401)
  }

  const token = await createToken(user.id, c.env.JWT_SECRET)

  return c.json({
    access_token: token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin
    }
  })
})

auth.get('/me', authMiddleware, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const user = await db.getUserById(userId)

  if (!user) {
    return c.json({ error: '用户不存在' }, 404)
  }

  return c.json({
    id: user.id,
    username: user.username,
    email: user.email,
    is_admin: user.is_admin
  })
})

auth.post('/logout', authMiddleware, async (c) => {
  return c.json({ message: '登出成功', success: true })
})

export default auth
