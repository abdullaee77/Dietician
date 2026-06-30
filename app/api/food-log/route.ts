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
    `SELECT food_name, food_type, complied FROM daily_food_log
     WHERE user_id = $1 AND date = $2`,
    [userId, today]
  )

  return NextResponse.json({ foodLog: rows })
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { food_name, food_type, complied } = await req.json()
  const today = todayISO()

  await query(
    `INSERT INTO daily_food_log (user_id, date, food_name, food_type, complied)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, date, food_name, food_type)
     DO UPDATE SET complied = $5`,
    [userId, today, food_name, food_type, complied]
  )

  return NextResponse.json({ success: true })
}