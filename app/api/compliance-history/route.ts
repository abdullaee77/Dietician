import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Last 14 days of food compliance
    const foodLogs = await query(
      `SELECT date, food_name, food_type, complied
       FROM daily_food_log
       WHERE user_id = $1
       AND date >= CURRENT_DATE - INTERVAL '14 days'
       ORDER BY date DESC`,
      [userId]
    )

    // Last 14 days of exercise compliance
    const exerciseLogs = await query(
      `SELECT del.date, del.completed, ep.name as exercise_name, ep.description as exercise_desc
       FROM daily_exercise_log del
       JOIN exercise_plan ep ON del.exercise_id = ep.id
       WHERE del.user_id = $1
       AND del.date >= CURRENT_DATE - INTERVAL '14 days'
       ORDER BY del.date DESC`,
      [userId]
    )

    // Group by date
    const dateMap: Record<string, any> = {}

    for (const f of foodLogs) {
      const d = new Date(f.date).toISOString().split('T')[0]
      if (!dateMap[d]) dateMap[d] = { date: d, foodChecks: [], exercises: [] }
      dateMap[d].foodChecks.push(f)
    }

    for (const e of exerciseLogs) {
      const d = new Date(e.date).toISOString().split('T')[0]
      if (!dateMap[d]) dateMap[d] = { date: d, foodChecks: [], exercises: [] }
      dateMap[d].exercises.push(e)
    }

    // Sort by date descending
    const result = Object.values(dateMap).sort((a: any, b: any) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return NextResponse.json({ data: result })
  } catch (err: any) {
    console.error('COMPLIANCE HISTORY ERROR:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}