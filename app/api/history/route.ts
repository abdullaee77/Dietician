import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const year = searchParams.get('year') ?? new Date().getFullYear().toString()
  const month = searchParams.get('month') ?? String(new Date().getMonth() + 1)

  try {
    // All daily logs for this month
    const logs = await query(
      `SELECT * FROM daily_logs
       WHERE user_id = $1
       AND EXTRACT(YEAR FROM date) = $2
       AND EXTRACT(MONTH FROM date) = $3
       ORDER BY date ASC`,
      [userId, year, month]
    )

    // Food compliance for this month
    const foodLogs = await query(
      `SELECT * FROM daily_food_log
       WHERE user_id = $1
       AND EXTRACT(YEAR FROM date) = $2
       AND EXTRACT(MONTH FROM date) = $3`,
      [userId, year, month]
    )

    // Exercise logs for this month
    const exerciseLogs = await query(
      `SELECT del.*, ep.name as exercise_name, ep.description as exercise_desc
       FROM daily_exercise_log del
       JOIN exercise_plan ep ON del.exercise_id = ep.id
       WHERE del.user_id = $1
       AND EXTRACT(YEAR FROM del.date) = $2
       AND EXTRACT(MONTH FROM del.date) = $3`,
      [userId, year, month]
    )

    return NextResponse.json({ logs, foodLogs, exerciseLogs })
  } catch (err: any) {
    console.error('HISTORY ERROR:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}