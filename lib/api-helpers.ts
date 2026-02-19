import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { NextResponse } from 'next/server'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), session: null }
  }
  return { error: null, session }
}

export async function requireRole(role: 'ADMIN' | 'MANAGER' | 'SALES') {
  const { error, session } = await requireAuth()
  if (error) return { error, session: null }

  const roleHierarchy = { ADMIN: 3, MANAGER: 2, SALES: 1 }
  const userRole = (session?.user?.role ?? 'SALES') as keyof typeof roleHierarchy

  if (roleHierarchy[userRole] < roleHierarchy[role]) {
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      session: null,
    }
  }
  return { error: null, session }
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}
