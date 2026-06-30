import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'
import { todayISO } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { weight_kg } = await req.json()
  if (!weight_kg) return NextResponse.json({ error: 'Weight required' }, { status: 400 })

  const today = todayISO()

  await query(
    `INSERT INTO weight_logs (user_id, date, weight_kg)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, date) DO UPDATE SET weight_kg = $3`,
    [userId, today, weight_kg]
  )

  await query(
    `UPDATE users SET initial_weight_logged = TRUE WHERE id = $1`,
    [userId]
  )

  return NextResponse.json({ success: true })
}

export async function GET() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await query(
    `SELECT initial_weight_logged FROM users WHERE id = $1`,
    [userId]
  )

  return NextResponse.json({ logged: rows[0]?.initial_weight_logged ?? false })
}