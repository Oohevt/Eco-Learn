import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { KVStore } from './db/kv.js'
import { hashPassword } from './utils/jwt.js'
import { initData } from './scripts/init-data.js'
import auth from './routes/auth.js'
import chapters from './routes/chapters.js'
import user from './routes/user.js'
import type { Env, Variables } from './types/index.js'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// 内存标记，避免重复检查
let isInitialized = false

app.use('*', cors({
  origin: '*',
  credentials: true
}))

app.use('*', async (c, next) => {
  const db = new KVStore(c.env.KV)
  c.set('db', db)
  await next()
})

// 在 /health 端点触发初始化（服务启动时自动调用）
app.get('/health', async (c) => {
  // 后台自动初始化数据
  if (!isInitialized) {
    const initialized = await c.env.KV.get('system:initialized')
    if (!initialized) {
      console.log('Auto-initializing data...')
      await initData(c.env.KV)
      isInitialized = true
    } else {
      isInitialized = true
    }
  }
  return c.json({ status: 'healthy' })
})

app.get('/api', (c) => {
  return c.json({
    message: 'EconoLearn API',
    version: '1.0.0',
    docs: '/docs'
  })
})

// 数据初始化端点（手动触发）
app.post('/init-data', async (c) => {
  try {
    await initData(c.env.KV)
    isInitialized = true
    return c.json({ message: '数据初始化完成', success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/init-admin', async (c) => {
  try {
    const body = await c.req.json()
    const username = body.username
    const password = body.password
    const store = new KVStore(c.env.KV)

    const existing = await store.getUserByUsername(username)
    if (existing) {
      return c.json({ success: false, message: '管理员已存在' }, 400)
    }

    const passwordHash = await hashPassword(password)
    const user = await store.createUser(username, `${username}@example.com`, passwordHash)

    return c.json({
      success: true,
      message: `管理员 ${username} 创建成功`,
      userId: user.id
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

app.route('/api/auth', auth)
app.route('/api/chapters', chapters)
app.route('/api/user', user)

export default app
