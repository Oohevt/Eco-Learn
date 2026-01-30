import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { KVStore } from './db/kv.js'
import auth from './routes/auth.js'
import chapters from './routes/chapters.js'
import user from './routes/user.js'

type AppType = typeof app

const app = new Hono<{ Bindings: any }>()

app.use('*', cors({
  origin: '*',
  credentials: true
}))

app.use('*', async (c, next) => {
  const db = new KVStore(c.env.KV)
  c.set('db', db)
  await next()
})

app.get('/health', (c) => {
  return c.json({ status: 'healthy' })
})

app.get('/api', (c) => {
  return c.json({
    message: 'EconoLearn API',
    version: '1.0.0',
    docs: '/docs'
  })
})

app.route('/api/auth', auth)
app.route('/api/chapters', chapters)
app.route('/api/user', user)

export default app
