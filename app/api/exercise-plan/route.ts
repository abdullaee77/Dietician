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

  const exercises = await query(
    `SELECT * FROM exercise_plan WHERE user_id = $1 ORDER BY sort_order ASC, id ASC`,
    [userId]
  )
  return NextResponse.json({ exercises })
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { exercises } = await req.json()

  await query(`DELETE FROM exercise_plan WHERE user_id = $1`, [userId])
  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i]
    if (ex.name?.trim()) {
      await query(
        `INSERT INTO exercise_plan (user_id, name, description, sort_order) VALUES ($1, $2, $3, $4)`,
        [userId, ex.name.trim(), ex.description?.trim() ?? '', i]
      )
    }
  }

  return NextResponse.json({ success: true })
}