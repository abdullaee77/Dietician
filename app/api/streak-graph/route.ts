import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await query(
    `SELECT date, completed FROM daily_logs
     WHERE user_id = $1
     ORDER BY date ASC`,
    [userId]
  )

  return NextResponse.json({ streakData: rows })
}