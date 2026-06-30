import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { name, pin } = await req.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 })
  }
  if (!pin?.trim() || pin.length < 4) {
    return NextResponse.json({ error: 'PIN must be at least 4 digits' }, { status: 400 })
  }

  await query('DELETE FROM daily_food_log')
  await query('DELETE FROM streak_logs')
  await query('DELETE FROM period_logs')
  await query('DELETE FROM weight_logs')
  await query('DELETE FROM daily_logs')
  await query('DELETE FROM users')
  await query('DELETE FROM skip_foods')
  await query('DELETE FROM must_eat_foods')
  await query('DELETE FROM trainer_plan')

  const rows = await query(
    'INSERT INTO users (name, pin, initial_weight_logged) VALUES ($1, $2, FALSE) RETURNING id, name, created_at',
    [name.trim(), pin.trim()]
  )
  const user = rows[0]

  await query(
    `INSERT INTO trainer_plan (exercise_desc, exercise_mins, sleep_hours, daily_quote, weight_interval_days, measurement_interval_days)
     VALUES ('Walk or light cardio', 30, 8, 'Every day is a fresh start.', 3, 7)`
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

  const users = await query('SELECT id, name, created_at FROM users LIMIT 1')

  if (!userId && users.length === 0) {
    return NextResponse.json({ user: null, needsSetup: true })
  }

  if (!userId) {
    return NextResponse.json({ user: null, needsSetup: false })
  }

  const rows = await query(
    'SELECT id, name, created_at FROM users WHERE id = $1',
    [userId]
  )

  return NextResponse.json({
    user: rows[0] ?? null,
    needsSetup: users.length === 0
  })
}