/**
 * EdgeOne Pages Node Function
 * 简化版本，使用 JavaScript 直接实现 API 端点
 */

// JWT 工具函数
const TOKEN_EXPIRY = 7 * 24 * 60 * 60

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

async function createToken(userId, secret) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }

  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY
  }

  const encoder = new TextEncoder()
  const headerEncoded = btoa(JSON.stringify(header))
  const payloadEncoded = btoa(JSON.stringify(payload))

  const signatureInput = `${headerEncoded}.${payloadEncoded}`
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signatureInput)
  )

  const signatureEncoded = btoa(String.fromCharCode(...new Uint8Array(signature)))
  return `${headerEncoded}.${payloadEncoded}.${signatureEncoded}`
}

async function verifyToken(token, secret) {
  try {
    const [headerEncoded, payloadEncoded, signatureEncoded] = token.split('.')
    const encoder = new TextEncoder()

    const header = JSON.parse(atob(headerEncoded))
    const payload = JSON.parse(atob(payloadEncoded))

    if (header.alg !== 'HS256') {
      return null
    }

    if (Date.now() / 1000 > payload.exp) {
      return null
    }

    const signatureInput = `${headerEncoded}.${payloadEncoded}`
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const signature = Uint8Array.from(atob(signatureEncoded), c => c.charCodeAt(0))
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      encoder.encode(signatureInput)
    )

    return isValid ? payload : null
  } catch {
    return null
  }
}

// KV 存储包装器
class KVStore {
  constructor(kv) {
    this.kv = kv
  }

  generateId() {
    return crypto.randomUUID()
  }

  now() {
    return new Date().toISOString()
  }

  // 用户相关
  async getUserById(id) {
    try {
      const data = await this.kv.get(`user:${id}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('getUserById error:', error)
      return null
    }
  }

  async getUserByUsername(username) {
    try {
      const userId = await this.kv.get(`username:${username}`)
      if (!userId) return null
      return this.getUserById(userId)
    } catch (error) {
      console.error('getUserByUsername error:', error)
      return null
    }
  }

  async getUserByEmail(email) {
    try {
      const userId = await this.kv.get(`email:${email}`)
      if (!userId) return null
      return this.getUserById(userId)
    } catch (error) {
      console.error('getUserByEmail error:', error)
      return null
    }
  }

  async createUser(username, email, passwordHash) {
    try {
      const id = this.generateId()
      const user = {
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
    } catch (error) {
      console.error('createUser error:', error)
      throw error
    }
  }

  // 章节相关
  async getChapterByChapterId(chapterId) {
    try {
      const id = await this.kv.get(`chapter_id:${chapterId}`)
      if (!id) return null
      const data = await this.kv.get(`chapter:${id}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('getChapterByChapterId error:', error)
      return null
    }
  }

  async listChapters(category, publishedOnly = true) {
    try {
      // EdgeOne KV 可能不支持 list 方法，使用备用方案
      // 这里使用预定义的章节ID列表来模拟
      const chapterIds = [
        'supply-demand',
        'elasticity',
        'gdp',
        'inflation',
        'stocks',
        'bonds'
      ]
      
      const chapters = []
      
      for (const chapterId of chapterIds) {
        const chapter = await this.getChapterByChapterId(chapterId)
        if (chapter) {
          if (publishedOnly && !chapter.is_published) continue
          if (category && chapter.category !== category) continue
          chapters.push(chapter)
        }
      }

      return chapters.sort((a, b) => a.order - b.order)
    } catch (error) {
      console.error('listChapters error:', error)
      return []
    }
  }

  async getCategoryStats() {
    const categoryNames = {
      micro: '微观经济学',
      macro: '宏观经济学',
      finance: '金融学'
    }

    const stats = []
    for (const [catId, catName] of Object.entries(categoryNames)) {
      const chapters = await this.listChapters(catId, true)
      stats.push({
        category: catId,
        name: catName,
        count: chapters.length
      })
    }

    return stats
  }

  // 进度相关
  async getUserProgress(userId) {
    try {
      // EdgeOne KV 可能不支持 list 方法，使用备用方案
      // 这里返回空数组，实际使用时需要根据具体情况调整
      return []
    } catch (error) {
      console.error('getUserProgress error:', error)
      return []
    }
  }

  async getProgress(userId, chapterId) {
    try {
      const data = await this.kv.get(`progress:${userId}:${chapterId}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('getProgress error:', error)
      return null
    }
  }

  async updateProgress(userId, chapterId, updates) {
    try {
      const existing = await this.getProgress(userId, chapterId)
      const now = this.now()

      const progress = existing
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
    } catch (error) {
      console.error('updateProgress error:', error)
      throw error
    }
  }
}

// 初始化章节数据
async function initData(kv) {
  const store = new KVStore(kv)
  const sampleChapters = [
    {
      chapter_id: 'supply-demand',
      title: '供需理论',
      description: '解释市场价格形成的核心机制',
      content: '供需理论是经济学的基础。供给是指在特定价格下，生产者愿意出售的商品数量；需求是指在特定价格下，消费者愿意购买的商品数量。当供给等于需求时，市场达到均衡状态，形成均衡价格。',
      simple_explanation: '就像菜市场的菜价，买的人多、卖的人少，价格就涨；买的人少、卖的人多，价格就跌。',
      category: 'micro',
      difficulty: 2,
      order: 1,
      examples: [
        { title: '疫情期间口罩价格上涨', explanation: '需求激增而供给不足' },
        { title: '夏季西瓜价格下降', explanation: '供给大量增加' }
      ],
      related_charts: ['supply-demand-chart'],
      is_published: true
    },
    {
      chapter_id: 'elasticity',
      title: '价格弹性',
      description: '衡量需求对价格变化的敏感程度',
      content: '价格弹性衡量的是当价格变化1%时，需求量变化的百分比。弹性大于1表示富有弹性（需求对价格敏感），弹性小于1表示缺乏弹性（需求对价格不敏感）。',
      simple_explanation: '奢侈品涨价大家就不买了，这是富有弹性；米面涨价大家还是得买，这是缺乏弹性。',
      category: 'micro',
      difficulty: 3,
      order: 2,
      examples: [
        { title: '苹果手机涨价', explanation: '部分消费者转向安卓' },
        { title: '食盐涨价', explanation: '消费者需求几乎不变' }
      ],
      related_charts: [],
      is_published: true
    },
    {
      chapter_id: 'gdp',
      title: '国内生产总值',
      description: '衡量一个国家经济活动总量的指标',
      content: 'GDP 是指一个国家或地区在一定时期内生产的所有最终产品和服务的市场价值。它包括消费、投资、政府支出和净出口四个组成部分。',
      simple_explanation: '就像计算一个家庭一年赚了多少钱，GDP 就是计算整个国家一年创造了多少价值。',
      category: 'macro',
      difficulty: 2,
      order: 3,
      examples: [
        { title: '中国GDP增长5%', explanation: '经济整体扩张' }
      ],
      related_charts: ['gdp-chart'],
      is_published: true
    },
    {
      chapter_id: 'inflation',
      title: '通货膨胀',
      description: '物价总水平持续上涨的经济现象',
      content: '通货膨胀是指货币供给超过实际需求，导致货币贬值、物价普遍上涨的现象。适度的通胀（2%左右）通常被认为是健康的，但恶性通胀会破坏经济。',
      simple_explanation: '100块钱去年能买10斤猪肉，今年只能买8斤，这就是通货膨胀。',
      category: 'macro',
      difficulty: 2,
      order: 4,
      examples: [
        { title: '2023年部分国家通胀率', explanation: '美国约4%，欧洲约6%' }
      ],
      related_charts: ['inflation-chart'],
      is_published: true
    },
    {
      chapter_id: 'stocks',
      title: '股票投资基础',
      description: '理解股票市场的基本原理',
      content: '股票代表公司所有权的一部分。投资者购买股票，实际上是在购买公司未来收益的份额。股票价格受公司业绩、行业趋势、宏观经济等多种因素影响。',
      simple_explanation: '买股票就是入股当老板，公司赚钱你分红，公司赔钱你也亏损。',
      category: 'finance',
      difficulty: 2,
      order: 5,
      examples: [
        { title: '苹果公司股票', explanation: '长期持有获得丰厚回报' }
      ],
      related_charts: [],
      is_published: true
    },
    {
      chapter_id: 'bonds',
      title: '债券投资',
      description: '固定收益类金融工具',
      content: '债券是政府或企业向投资者发行的债务凭证。债券持有人定期获得利息，到期收回本金。债券风险通常低于股票，收益也相对稳定。',
      simple_explanation: '借钱给国家或公司，定期收利息，到期拿回本金。',
      category: 'finance',
      difficulty: 2,
      order: 6,
      examples: [
        { title: '国债', explanation: '风险最低，收益稳定' }
      ],
      related_charts: [],
      is_published: true
    }
  ]

  for (const chapterData of sampleChapters) {
    try {
      const existing = await store.getChapterByChapterId(chapterData.chapter_id)
      if (existing) {
        continue
      }

      const id = store.generateId()
      const chapter = {
        id,
        ...chapterData,
        created_at: store.now(),
        updated_at: store.now()
      }

      await kv.put(`chapter:${id}`, JSON.stringify(chapter))
      await kv.put(`chapter_id:${chapterData.chapter_id}`, id)
    } catch (error) {
      console.error('init chapter error:', error)
    }
  }
}

// 主处理函数
const JWT_SECRET = process.env.JWT_SECRET || 'econolearn-jwt-secret-key-2024-production-secure'

export default {
  async fetch(request, env, context) {
    try {
      const url = new URL(request.url)
      const path = url.pathname

      // 健康检查
      if (path === '/health') {
        return new Response(JSON.stringify({ status: 'healthy' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // API 信息
      if (path === '/api') {
        return new Response(JSON.stringify({
          message: 'EconoLearn API',
          version: '1.0.0',
          docs: '/docs'
        }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // 初始化数据
      if (path === '/init-data' && request.method === 'POST') {
        // 检查是否有 KV 存储
        if (!env.KV) {
          return new Response(JSON.stringify({ error: 'KV 存储未配置' }), { status: 500 })
        }
        await initData(env.KV)
        return new Response(JSON.stringify({ message: '数据初始化完成', success: true }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // 章节相关
      if (path === '/api/chapters/stats' && request.method === 'GET') {
        // 检查是否有 KV 存储
        if (!env.KV) {
          return new Response(JSON.stringify({ error: 'KV 存储未配置' }), { status: 500 })
        }
        const store = new KVStore(env.KV)
        const stats = await store.getCategoryStats()
        return new Response(JSON.stringify(stats), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      if (path === '/api/chapters' && request.method === 'GET') {
        // 检查是否有 KV 存储
        if (!env.KV) {
          return new Response(JSON.stringify({ error: 'KV 存储未配置' }), { status: 500 })
        }
        const store = new KVStore(env.KV)
        const category = url.searchParams.get('category')
        const page = parseInt(url.searchParams.get('page') || '1')
        const pageSize = Math.min(parseInt(url.searchParams.get('page_size') || '50'), 100)

        const allChapters = await store.listChapters(category || undefined, true)
        const total = allChapters.length
        const items = allChapters.slice((page - 1) * pageSize, page * pageSize)

        return new Response(JSON.stringify({ items, total, page, page_size: pageSize }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      if (path.startsWith('/api/chapters/') && request.method === 'GET') {
        // 检查是否有 KV 存储
        if (!env.KV) {
          return new Response(JSON.stringify({ error: 'KV 存储未配置' }), { status: 500 })
        }
        const store = new KVStore(env.KV)
        const chapterId = path.split('/').pop()
        const chapter = await store.getChapterByChapterId(chapterId)

        if (!chapter) {
          return new Response(JSON.stringify({ error: '章节不存在' }), { status: 404 })
        }

        return new Response(JSON.stringify(chapter), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // 认证相关
      if (path === '/api/auth/register' && request.method === 'POST') {
        // 检查是否有 KV 存储
        if (!env.KV) {
          return new Response(JSON.stringify({ error: 'KV 存储未配置' }), { status: 500 })
        }
        const store = new KVStore(env.KV)
        const { username, email, password } = await request.json()

        if (!username || !email || !password) {
          return new Response(JSON.stringify({ error: '请提供用户名、邮箱和密码' }), { status: 400 })
        }

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
      }

      if (path === '/api/auth/login' && request.method === 'POST') {
        // 检查是否有 KV 存储
        if (!env.KV) {
          return new Response(JSON.stringify({ error: 'KV 存储未配置' }), { status: 500 })
        }
        const store = new KVStore(env.KV)
        const { username, password } = await request.json()

        if (!username || !password) {
          return new Response(JSON.stringify({ error: '请提供用户名和密码' }), { status: 400 })
        }

        const user = await store.getUserByUsername(username)
        if (!user) {
          return new Response(JSON.stringify({ error: '用户名或密码错误' }), { status: 401 })
        }

        const valid = await verifyPassword(password, user.password_hash)
        if (!valid) {
          return new Response(JSON.stringify({ error: '用户名或密码错误' }), { status: 401 })
        }

        const token = await createToken(user.id, JWT_SECRET)

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
      }

      if (path === '/api/auth/me' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: '未授权' }), { status: 401 })
        }

        const token = authHeader.substring(7)
        const payload = await verifyToken(token, JWT_SECRET)

        if (!payload) {
          return new Response(JSON.stringify({ error: 'Token 无效' }), { status: 401 })
        }

        // 检查是否有 KV 存储
        if (!env.KV) {
          return new Response(JSON.stringify({ error: 'KV 存储未配置' }), { status: 500 })
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
      }

      // 进度相关
      if (path === '/api/user/progress' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: '未授权' }), { status: 401 })
        }

        const token = authHeader.substring(7)
        const payload = await verifyToken(token, JWT_SECRET)

        if (!payload) {
          return new Response(JSON.stringify({ error: 'Token 无效' }), { status: 401 })
        }

        // 检查是否有 KV 存储
        if (!env.KV) {
          return new Response(JSON.stringify({ error: 'KV 存储未配置' }), { status: 500 })
        }
        const store = new KVStore(env.KV)
        const progress = await store.getUserProgress(payload.sub)

        return new Response(JSON.stringify(progress), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      if (path === '/api/user/progress' && request.method === 'POST') {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: '未授权' }), { status: 401 })
        }

        const token = authHeader.substring(7)
        const payload = await verifyToken(token, JWT_SECRET)

        if (!payload) {
          return new Response(JSON.stringify({ error: 'Token 无效' }), { status: 401 })
        }

        // 检查是否有 KV 存储
        if (!env.KV) {
          return new Response(JSON.stringify({ error: 'KV 存储未配置' }), { status: 500 })
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
      }

      // 404
      return new Response('Not Found', { status: 404 })
    } catch (error) {
      console.error('Error:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}
