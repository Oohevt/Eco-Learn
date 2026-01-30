import { KVStore } from '../src/db/kv.js'
import { hashPassword } from '../src/utils/jwt.js'

async function initAdmin(kv: KVNamespace, username: string, password: string) {
  const store = new KVStore(kv)

  const existing = await store.getUserByUsername(username)
  if (existing) {
    return { success: false, message: '管理员已存在' }
  }

  const passwordHash = await hashPassword(password)
  const user = await store.createUser(username, `${username}@example.com`, passwordHash)

  return {
    success: true,
    message: `管理员 ${username} 创建成功`,
    userId: user.id
  }
}

export default {
  async fetch(request: Request, env: any) {
    if (request.method !== 'POST') {
      return new Response('请使用 POST 请求', { status: 405 })
    }

    const body = await request.json() as { username: string; password: string }
    const { username, password } = body

    if (!username || !password) {
      return new Response('请提供用户名和密码', { status: 400 })
    }

    const result = await initAdmin(env.KV, username, password)

    return new Response(JSON.stringify(result, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
