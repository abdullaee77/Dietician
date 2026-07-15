import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { name, username, pin } = await req.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 })
  }
  if (!username?.trim()) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 })
  }
  if (!pin?.trim() || pin.length < 4) {
    return NextResponse.json({ error: 'PIN must be at least 4 digits' }, { status: 400 })
  }

  // Check username is unique
  const existing = await query(
    'SELECT id FROM users WHERE username = $1',
    [username.trim().toLowerCase()]
  )
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Username already taken — choose another' }, { status: 400 })
  }

  // Create new user — don't touch other users' data
  const rows = await query(
    `INSERT INTO users (name, username, pin, initial_weight_logged)
     VALUES ($1, $2, $3, FALSE)
     RETURNING id, name, username, created_at`,
    [name.trim(), username.trim().toLowerCase(), pin.trim()]
  )
  const user = rows[0]

  // Each user gets their own trainer plan row
await query(
  `INSERT INTO trainer_plan (user_id, exercise_desc, exercise_mins, sleep_hours, daily_quote, weight_interval_days, measurement_interval_days)
   VALUES ($1, 'Walk or light cardio', 30, 8, 'Every day is a fresh start.', 3, 7)`,
  [user.id]
)

  const cookieStore = await cookies()
  cookieStore.set('user_id', String(user.id), {
    httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 365,
  })
  cookieStore.set('auth', 'true', {
    httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 365,
  })

  return NextResponse.json({ user })
}

export async function GET() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    return NextResponse.json({ user: null, needsSetup: false })
  }

  const rows = await query(
    'SELECT id, name, created_at FROM users WHERE id = $1',
    [userId]
  )

  return NextResponse.json({
    user: rows[0] ?? null,
    needsSetup: false
  })
}