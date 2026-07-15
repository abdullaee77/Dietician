import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'

async function getUserId() {
  const cookieStore = await cookies()
  return cookieStore.get('user_id')?.value ?? null
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const plan = await query(
    `SELECT * FROM trainer_plan WHERE user_id = $1 ORDER BY id LIMIT 1`,
    [userId]
  )
  const skipFoods = await query(
    `SELECT * FROM skip_foods WHERE user_id = $1 ORDER BY id`,
    [userId]
  )
  const mustEatFoods = await query(
    `SELECT * FROM must_eat_foods WHERE user_id = $1 ORDER BY id`,
    [userId]
  )

  return NextResponse.json({ plan: plan[0] ?? null, skipFoods, mustEatFoods })
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    exercise_desc, exercise_mins, sleep_hours, daily_quote,
    weight_interval_days, skipFoods, mustEatFoods
  } = body

  if (exercise_desc !== undefined) {
    const existing = await query(
      `SELECT id FROM trainer_plan WHERE user_id = $1 LIMIT 1`,
      [userId]
    )
    if (existing.length > 0) {
      await query(
        `UPDATE trainer_plan SET
          exercise_desc=$1, exercise_mins=$2,
          sleep_hours=$3, daily_quote=$4,
          weight_interval_days=$5,
          updated_at=NOW()
         WHERE user_id=$6`,
        [exercise_desc, exercise_mins, sleep_hours, daily_quote,
         weight_interval_days ?? 3, userId]
      )
    } else {
      await query(
        `INSERT INTO trainer_plan (user_id, exercise_desc, exercise_mins, sleep_hours, daily_quote, weight_interval_days, measurement_interval_days)
         VALUES ($1, $2, $3, $4, $5, $6, 7)`,
        [userId, exercise_desc, exercise_mins, sleep_hours, daily_quote, weight_interval_days ?? 3]
      )
    }
  }

  if (skipFoods !== undefined) {
    await query(`DELETE FROM skip_foods WHERE user_id = $1`, [userId])
    for (const food of skipFoods) {
      if (food.name?.trim()) {
        await query(
          `INSERT INTO skip_foods (user_id, name, reason) VALUES ($1, $2, $3)`,
          [userId, food.name.trim(), food.reason?.trim() ?? '']
        )
      }
    }
  }

  if (mustEatFoods !== undefined) {
    await query(`DELETE FROM must_eat_foods WHERE user_id = $1`, [userId])
    for (const food of mustEatFoods) {
      if (food.name?.trim()) {
        await query(
          `INSERT INTO must_eat_foods (user_id, name, reason) VALUES ($1, $2, $3)`,
          [userId, food.name.trim(), food.reason?.trim() ?? '']
        )
      }
    }
  }

  return NextResponse.json({ success: true })
}