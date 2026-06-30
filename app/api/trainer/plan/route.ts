import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  const plan = await query(`SELECT * FROM trainer_plan ORDER BY id LIMIT 1`)
  const skipFoods = await query(`SELECT * FROM skip_foods ORDER BY id`)
  const mustEatFoods = await query(`SELECT * FROM must_eat_foods ORDER BY id`)
  return NextResponse.json({ plan: plan[0], skipFoods, mustEatFoods })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    exercise_desc, exercise_mins, sleep_hours, daily_quote,
    weight_interval_days, measurement_interval_days,
    skipFoods, mustEatFoods
  } = body

  if (exercise_desc !== undefined) {
    await query(
      `UPDATE trainer_plan SET
        exercise_desc=$1, exercise_mins=$2,
        sleep_hours=$3, daily_quote=$4,
        weight_interval_days=$5, measurement_interval_days=$6,
        updated_at=NOW()
       WHERE id=(SELECT id FROM trainer_plan ORDER BY id LIMIT 1)`,
      [
        exercise_desc, exercise_mins, sleep_hours, daily_quote,
        weight_interval_days ?? 3, measurement_interval_days ?? 7
      ]
    )
  }

  if (skipFoods !== undefined) {
    await query(`DELETE FROM skip_foods`)
    for (const food of skipFoods) {
      if (food.name?.trim()) {
        await query(`INSERT INTO skip_foods (name, reason) VALUES ($1, $2)`,
          [food.name.trim(), food.reason?.trim() ?? ''])
      }
    }
  }

  if (mustEatFoods !== undefined) {
    await query(`DELETE FROM must_eat_foods`)
    for (const food of mustEatFoods) {
      if (food.name?.trim()) {
        await query(`INSERT INTO must_eat_foods (name, reason) VALUES ($1, $2)`,
          [food.name.trim(), food.reason?.trim() ?? ''])
      }
    }
  }

  return NextResponse.json({ success: true })
}