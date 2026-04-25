// Helpers d'auth compatibles Edge runtime (Web Crypto only).
// Importables depuis le middleware sans tirer next/headers.

const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 7 * 1000 // 7 jours

async function hmacSign(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function getSecret(): string {
  const s = process.env['ADMIN_SECRET_SALT']
  if (!s || s.length < 16) {
    throw new Error('ADMIN_SECRET_SALT manquant ou trop court (min 16 caractères)')
  }
  return s
}

export async function generateAdminToken(): Promise<string> {
  const ts = Date.now().toString(36)
  const sig = await hmacSign(ts, getSecret())
  return `kalm_${ts}_${sig}`
}

export async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  if (!token || !token.startsWith('kalm_')) return false

  const parts = token.split('_')
  if (parts.length !== 3) return false
  const [, ts, sig] = parts
  if (!ts || !sig) return false

  let secret: string
  try {
    secret = getSecret()
  } catch {
    return false
  }

  const expected = await hmacSign(ts, secret)
  if (sig !== expected) return false

  const issuedAt = parseInt(ts, 36)
  if (!Number.isFinite(issuedAt)) return false
  const age = Date.now() - issuedAt
  if (age < 0 || age > SESSION_MAX_AGE_MS) return false

  return true
}
