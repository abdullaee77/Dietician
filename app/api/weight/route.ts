import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'
import { todayISO } from '@/lib/utils'

async function getUserId() {
  const cookieStore = await cookies()
  return cookieStore.get('user_id')?.value ?? null
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { weight_kg } = await req.json()
  const today = todayISO()

  await query(
    `INSERT INTO weight_logs (user_id, date, weight_kg)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, date) DO UPDATE SET weight_kg = $3`,
    [userId, today, weight_kg]
  )

  return NextResponse.json({ success: true })
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await query(
    `SELECT date, weight_kg FROM weight_logs
     WHERE user_id = $1 ORDER BY date ASC`,
    [userId]
  )

  // Also get today's weight if exists
  const today = todayISO()
  const todayWeight = await query(
    `SELECT weight_kg FROM weight_logs
     WHERE user_id = $1 AND date = $2`,
    [userId, today]
  )

  return NextResponse.json({
    weights: rows,
    todayWeight: todayWeight[0]?.weight_kg ?? null
  })
}