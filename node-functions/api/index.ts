import { KVStore } from '../../backend/src/db/kv.js'
import { hashPassword, createToken, verifyToken } from '../../backend/src/utils/jwt.js'
import { initData } from '../../backend/src/scripts/init-data.js'

// 使用默认导出，适配 EdgeOne Pages
export default {
  async fetch(request: Request, env: any, context: any) {
    const url = new URL(request.url)
    const path = url.pathname

    if (path === '/health') {
      return new Response(JSON.stringify({ status: 'healthy' }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (path === '/api') {
      return new Response(JSON.stringify({
        message: 'EconoLearn API',
        version: '1.0.0',
        docs: '/docs'
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (path === '/api/auth/register' && request.method === 'POST') {
      return handleRegister(request, env)
    }

    if (path === '/api/auth/login' && request.method === 'POST') {
      return handleLogin(request, env)
    }

    if (path === '/api/auth/me' && request.method === 'GET') {
      return handleGetMe(request, env)
    }

    if (path === '/api/auth/logout' && request.method === 'POST') {
      return new Response(JSON.stringify({ message: '登出成功', success: true }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (path === '/api/chapters/stats' && request.method === 'GET') {
      return handleChapterStats(env)
    }

    if (path === '/api/chapters' && request.method === 'GET') {
      return handleListChapters(request, env)
    }

    if (path.startsWith('/api/chapters/') && request.method === 'GET') {
      const chapterId = path.split('/').pop()
      return handleGetChapter(chapterId, env)
    }

    if (path === '/api/user/progress' && request.method === 'GET') {
      return handleGetProgress(request, env)
    }

    if (path === '/api/user/progress' && request.method === 'POST') {
      return handleUpdateProgress(request, env)
    }

    if (path.startsWith('/api/user/progress/') && request.method === 'GET') {
      const chapterId = path.split('/').pop()
      return handleGetChapterProgress(request, env, chapterId)
    }

    if (path === '/init-data' && request.method === 'POST') {
      return handleInitData(env)
    }

    if (path === '/init-admin' && request.method === 'POST') {
      return handleInitAdmin(request, env)
    }

    // 静态文件请求，返回 404 让 EdgeOne Pages 处理
    return new Response('Not Found', { status: 404 })
  }
}

async function handleRegister(request: Request, env: any) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return new Response(JSON.stringify({ error: '请提供用户名、邮箱和密码' }), { status: 400 })
    }

    const store = new KVStore(env.KV)
    const existing = await store.getUserByUsername(username) || await store.getUserByEmail(email)
    if (existing) {
      return new Response(JSON.stringify({ error: '用户名或邮箱已存在' }), { status: 400 })
    }

    const passwordHash = await hashPassword(password)
    const user = await store.createUser(username, email, passwordHash)

    return new Response(JSON.stringify({
      message: `用户 ${user.username} 注册成功`,
      success: true
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

async function handleLogin(request: Request, env: any) {
  try {
    const body = await request.json()
    const username = body.username
    const password = body.password

    if (!username || !password) {
      return new Response(JSON.stringify({ error: '请提供用户名和密码' }), { status: 400 })
    }

    const store = new KVStore(env.KV)
    const user = await store.getUserByUsername(username)

    if (!user) {
      return new Response(JSON.stringify({ error: '用户名或密码错误' }), { status: 401 })
    }

    const valid = await import('../../backend/src/utils/jwt.js').then(({ verifyPassword }) => {
      return verifyPassword(password, user.password_hash)
    })

    if (!valid) {
      return new Response(JSON.stringify({ error: '用户名或密码错误' }), { status: 401 })
    }

    const token = await createToken(user.id, env.JWT_SECRET)

    return new Response(JSON.stringify({
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

async function handleGetMe(request: Request, env: any) {
  try {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: '未授权' }), { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = await verifyToken(token, env.JWT_SECRET)

    if (!payload) {
      return new Response(JSON.stringify({ error: 'Token 无效' }), { status: 401 })
    }

    const store = new KVStore(env.KV)
    const user = await store.getUserById(payload.sub)

    if (!user) {
      return new Response(JSON.stringify({ error: '用户不存在' }), { status: 404 })
    }

    return new Response(JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

async function handleChapterStats(env: any) {
  try {
    const store = new KVStore(env.KV)
    const stats = await store.getCategoryStats()
    return new Response(JSON.stringify(stats), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

async function handleListChapters(request: Request, env: any) {
  try {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = Math.min(parseInt(url.searchParams.get('page_size') || '50'), 100)

    const store = new KVStore(env.KV)
    const allChapters = await store.listChapters(category || undefined, true)
    const total = allChapters.length
    const items = allChapters.slice((page - 1) * pageSize, page * pageSize)

    return new Response(JSON.stringify({ items, total, page, page_size: pageSize }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

async function handleGetChapter(chapterId: string, env: any) {
  try {
    const store = new KVStore(env.KV)
    const chapter = await store.getChapterByChapterId(chapterId)

    if (!chapter) {
      return new Response(JSON.stringify({ error: '章节不存在' }), { status: 404 })
    }

    return new Response(JSON.stringify(chapter), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

async function handleGetProgress(request: Request, env: any) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: '未授权' }), { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = await verifyToken(token, env.JWT_SECRET)

    if (!payload) {
      return new Response(JSON.stringify({ error: 'Token 无效' }), { status: 401 })
    }

    const store = new KVStore(env.KV)
    const progress = await store.getUserProgress(payload.sub)

    return new Response(JSON.stringify(progress), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

async function handleUpdateProgress(request: Request, env: any) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: '未授权' }), { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = await verifyToken(token, env.JWT_SECRET)

    if (!payload) {
      return new Response(JSON.stringify({ error: 'Token 无效' }), { status: 401 })
    }

    const body = await request.json()
    const { chapter_id, completed, score } = body

    const store = new KVStore(env.KV)
    const progress = await store.updateProgress(payload.sub, chapter_id, {
      completed,
      score
    })

    return new Response(JSON.stringify(progress), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

async function handleGetChapterProgress(request: Request, env: any, chapterId: string) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: '未授权' }), { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = await verifyToken(token, env.JWT_SECRET)

    if (!payload) {
      return new Response(JSON.stringify({ error: 'Token 无效' }), { status: 401 })
    }

    const store = new KVStore(env.KV)
    const progress = await store.getProgress(payload.sub, chapterId)

    if (!progress) {
      return new Response(JSON.stringify({ error: '进度不存在' }), { status: 404 })
    }

    return new Response(JSON.stringify(progress), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

async function handleInitData(env: any) {
  try {
    await initData(env.KV)
    return new Response(JSON.stringify({ message: '数据初始化完成', success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

async function handleInitAdmin(request: Request, env: any) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return new Response(JSON.stringify({ error: '请提供用户名和密码' }), { status: 400 })
    }

    const store = new KVStore(env.KV)
    const existing = await store.getUserByUsername(username)
    if (existing) {
      return new Response(JSON.stringify({ success: false, message: '管理员已存在' }), { status: 400 })
    }

    const passwordHash = await hashPassword(password)
    const user = await store.createUser(username, `${username}@example.com`, passwordHash)

    return new Response(JSON.stringify({
      success: true,
      message: `管理员 ${username} 创建成功`,
      userId: user.id
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
