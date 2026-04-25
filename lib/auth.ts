import { cookies } from 'next/headers'
import { generateAdminToken, verifyAdminToken } from './auth-edge'

const SESSION_COOKIE = 'kalm-admin-session'
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7 // 7 jours

export async function login(password: string): Promise<boolean> {
  if (password !== process.env['ADMIN_PASSWORD']) {
    return false
  }

  const token = await generateAdminToken()
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SEC,
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
  return verifyAdminToken(session?.value)
}
