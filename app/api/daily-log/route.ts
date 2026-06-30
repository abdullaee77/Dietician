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
  const logs = await query(
    `SELECT * FROM daily_logs WHERE user_id = $1 AND date = $2`,
    [userId, today]
  )
  const plan = await query(`SELECT * FROM trainer_plan ORDER BY id LIMIT 1`)
  const skipFoods = await query(`SELECT * FROM skip_foods`)
  const mustEatFoods = await query(`SELECT * FROM must_eat_foods`)
  const user = await query(
    `SELECT id, name, created_at FROM users WHERE id = $1`,
    [userId]
  )

  return NextResponse.json({
    log: logs[0] ?? null,
    plan: plan[0] ?? null,
    skipFoods,
    mustEatFoods,
    user: user[0],
    today,
  })
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const today = todayISO()

  await query(
    `INSERT INTO daily_logs (
      user_id, date,
      breakfast_food, breakfast_time, breakfast_skipped,
      lunch_food, lunch_time, lunch_skipped,
      dinner_food, dinner_time, dinner_skipped,
      snack_food, snack_time,
      extra_meals,
      water_glasses, steps,
      exercise_desc, exercise_mins,
      sleep_time, wake_time, sleep_hours,
      energy_level, bloating, flex_meal, completed
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,
      $15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25
    )
    ON CONFLICT (user_id, date) DO UPDATE SET
      breakfast_food=$3, breakfast_time=$4, breakfast_skipped=$5,
      lunch_food=$6, lunch_time=$7, lunch_skipped=$8,
      dinner_food=$9, dinner_time=$10, dinner_skipped=$11,
      snack_food=$12, snack_time=$13,
      extra_meals=$14,
      water_glasses=$15, steps=$16,
      exercise_desc=$17, exercise_mins=$18,
      sleep_time=$19, wake_time=$20, sleep_hours=$21,
      energy_level=$22, bloating=$23,
      flex_meal=$24, completed=$25`,
    [
      userId, today,
      body.breakfast_food ?? null, body.breakfast_time ?? null, body.breakfast_skipped ?? false,
      body.lunch_food ?? null, body.lunch_time ?? null, body.lunch_skipped ?? false,
      body.dinner_food ?? null, body.dinner_time ?? null, body.dinner_skipped ?? false,
      body.snack_food ?? null, body.snack_time ?? null,
      JSON.stringify(body.extra_meals ?? []),
      body.water_glasses ?? 0, body.steps ?? null,
      body.exercise_desc ?? null, body.exercise_mins ?? null,
      body.sleep_time ?? null, body.wake_time ?? null, body.sleep_hours ?? null,
      body.energy_level ?? null, body.bloating ?? null,
      body.flex_meal ?? null, body.completed ?? false,
    ]
  )

  return NextResponse.json({ success: true })
}