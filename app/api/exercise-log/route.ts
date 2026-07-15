import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'
import { todayISO } from '@/lib/utils'

async function getUserId() {
  const cookieStore = await cookies()
  return cookieStore.get('user_id')?.value ?? null
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = todayISO()
  const rows = await query(
    `SELECT exercise_id, completed FROM daily_exercise_log
     WHERE user_id = $1 AND date = $2`,
    [userId, today]
  )
  return NextResponse.json({ exerciseLog: rows })
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { exercise_id, completed } = await req.json()
  const today = todayISO()

  await query(
    `INSERT INTO daily_exercise_log (user_id, date, exercise_id, completed)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, date, exercise_id)
     DO UPDATE SET completed = $4`,
    [userId, today, exercise_id, completed]
  )

  return NextResponse.json({ success: true })
}