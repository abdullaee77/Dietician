import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const weights = await query(
    `SELECT date, weight_kg FROM weight_logs
     WHERE user_id = $1 ORDER BY date ASC`,
    [userId]
  )

  const logs = await query(
    `SELECT date, completed, water_glasses, steps,
            breakfast_time, lunch_time, dinner_time,
            sleep_time, wake_time, sleep_hours,
            breakfast_skipped, lunch_skipped, dinner_skipped
     FROM daily_logs
     WHERE user_id = $1 ORDER BY date DESC`,
    [userId]
  )

  const stepsLogs = await query(
    `SELECT date, steps FROM daily_logs
     WHERE user_id = $1 AND steps IS NOT NULL
     ORDER BY date ASC`,
    [userId]
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  let waterStreak = 0
  let stepsStreak = 0

  for (let i = 0; i < logs.length; i++) {
    const logDate = new Date(logs[i].date)
    logDate.setHours(0, 0, 0, 0)
    const diff = Math.round((today.getTime() - logDate.getTime()) / 86400000)
    if (diff === i && logs[i].completed) streak++
    else break
  }

  for (let i = 0; i < logs.length; i++) {
    const logDate = new Date(logs[i].date)
    logDate.setHours(0, 0, 0, 0)
    const diff = Math.round((today.getTime() - logDate.getTime()) / 86400000)
    if (diff === i && logs[i].water_glasses >= 8) waterStreak++
    else break
  }

  for (let i = 0; i < logs.length; i++) {
    const logDate = new Date(logs[i].date)
    logDate.setHours(0, 0, 0, 0)
    const diff = Math.round((today.getTime() - logDate.getTime()) / 86400000)
    if (diff === i && logs[i].steps >= 8000) stepsStreak++
    else break
  }

  const waterData = logs.slice().reverse().map((l: any) => ({
    date: l.date,
    glasses: l.water_glasses ?? 0,
  }))

  const mealTimesData = logs.slice().reverse().map((l: any) => ({
    date: l.date,
    breakfast: l.breakfast_skipped ? null : l.breakfast_time,
    lunch: l.lunch_skipped ? null : l.lunch_time,
    dinner: l.dinner_skipped ? null : l.dinner_time,
  }))

  const sleepData = logs.slice().reverse().map((l: any) => ({
    date: l.date,
    hours: l.sleep_hours ? Number(l.sleep_hours) : 0,
  }))

  const submitData = logs.slice(0, 30).reverse().map((l: any) => ({
    date: l.date,
    completed: l.completed,
  }))

  return NextResponse.json({
    weights,
    streak,
    waterStreak,
    stepsStreak,
    totalDays: logs.length,
    waterData,
    mealTimesData,
    sleepData,
    submitData,
    stepsData: stepsLogs,
    logs,
  })
}