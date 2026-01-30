import { Context, Next } from 'hono'
import { verifyToken } from '../utils/jwt.js'
import type { Env, Variables } from '../types/index.js'

export async function authMiddleware(c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: '未授权' }, 401)
  }

  const token = authHeader.substring(7)
  const payload = await verifyToken(token, c.env.JWT_SECRET)

  if (!payload) {
    return c.json({ error: 'Token 无效' }, 401)
  }

  c.set('userId', payload.sub)
  await next()
}

export async function adminMiddleware(c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) {
  const userId = c.get('userId')
  if (!userId) {
    return c.json({ error: '未授权' }, 401)
  }
  const user = await c.get('db').getUserById(userId)

  if (!user || !user.is_admin) {
    return c.json({ error: '权限不足' }, 403)
  }

  await next()
}
