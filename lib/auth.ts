import { cookies } from 'next/headers'

const SESSION_COOKIE = 'kalm-admin-session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function generateToken(password: string): string {
  // Simple hash — not cryptographic, but enough for a basic admin panel
  const encoder = new TextEncoder()
  const data = encoder.encode(password + process.env['ADMIN_SECRET_SALT']!)
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data[i] ?? 0
    hash = ((hash << 5) - hash + char) | 0
  }
  return `kalm_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`
}

export async function login(password: string): Promise<boolean> {
  if (password !== process.env['ADMIN_PASSWORD']) {
    return false
  }

  const token = generateToken(password)
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })

  return true
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  return !!session?.value?.startsWith('kalm_')
}
