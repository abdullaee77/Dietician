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

  const measurements = await query(
    `SELECT date, waist_cm, hips_cm, arms_cm FROM measurements
     WHERE user_id = $1 ORDER BY date ASC`,
    [userId]
  )

  const periodDays = await query(
    `SELECT date FROM period_logs WHERE user_id = $1`,
    [userId]
  )

  const logs = await query(
    `SELECT date, completed, water_glasses, steps,
            breakfast_time, lunch_time, dinner_time, snack_time,
            sleep_time, wake_time, sleep_hours,
            breakfast_skipped, lunch_skipped, dinner_skipped,
            extra_meals
     FROM daily_logs
     WHERE user_id = $1 ORDER BY date DESC`,
    [userId]
  )

  // Streaks
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  let waterStreak = 0
  let stepsStreak = 0

  for (let i = 0; i < logs.length; i++) {
    const logDate = new Date(logs[i].date)
    logDate.setHours(0, 0, 0, 0)
    const diff = Math.round((today.getTime() - logDate.getTime()) / 86400000)
    if (diff === i) {
      if (logs[i].completed) streak++
      else break
    } else break
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

  // Water chart data
  const waterData = logs.slice().reverse().map((l: any) => ({
    date: l.date,
    glasses: l.water_glasses ?? 0,
  }))

  // Meal times chart
  const mealTimesData = logs.slice().reverse().map((l: any) => ({
    date: l.date,
    breakfast: l.breakfast_skipped ? null : l.breakfast_time,
    lunch: l.lunch_skipped ? null : l.lunch_time,
    dinner: l.dinner_skipped ? null : l.dinner_time,
  }))

  // Sleep chart
  const sleepData = logs.slice().reverse().map((l: any) => ({
    date: l.date,
    hours: l.sleep_hours ? Number(l.sleep_hours) : 0,
    sleep_time: l.sleep_time,
    wake_time: l.wake_time,
  }))

  // Submit streak calendar (last 30 days)
  const submitData = logs.slice(0, 30).reverse().map((l: any) => ({
    date: l.date,
    completed: l.completed,
  }))

  return NextResponse.json({
    weights,
    measurements,
    periodDays: periodDays.map((r: any) => r.date),
    streak,
    waterStreak,
    stepsStreak,
    totalDays: logs.length,
    waterData,
    mealTimesData,
    sleepData,
    submitData,
    logs,
  })
}