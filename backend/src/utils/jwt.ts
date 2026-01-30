import { subtle } from 'crypto'

const TOKEN_EXPIRY = 7 * 24 * 60 * 60

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

export async function createToken(userId: string, secret: string): Promise<string> {
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
  const key = await subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await subtle.sign(
    'HMAC',
    key,
    encoder.encode(signatureInput)
  )

  const signatureEncoded = btoa(String.fromCharCode(...new Uint8Array(signature)))
  return `${headerEncoded}.${payloadEncoded}.${signatureEncoded}`
}

export async function verifyToken(token: string, secret: string): Promise<any> {
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
    const key = await subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const signature = Uint8Array.from(atob(signatureEncoded), c => c.charCodeAt(0))
    const isValid = await subtle.verify(
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
