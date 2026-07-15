import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { username, pin } = await req.json()

  if (!username?.trim() || !pin?.trim()) {
    return NextResponse.json({ error: 'Username and PIN required' }, { status: 400 })
  }

  const rows = await query(
    'SELECT id, name FROM users WHERE username = $1 AND pin = $2 LIMIT 1',
    [username.trim().toLowerCase(), pin.trim()]
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Wrong username or PIN' }, { status: 401 })
  }

  const user = rows[0]
  const cookieStore = await cookies()
  cookieStore.set('user_id', String(user.id), {
    httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 365,
  })
  cookieStore.set('auth', 'true', {
    httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 365,
  })

  return NextResponse.json({ success: true, user })
}