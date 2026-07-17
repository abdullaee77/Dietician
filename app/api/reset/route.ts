import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { confirm } = await req.json()
    if (confirm !== 'RESET') {
      return NextResponse.json({ error: 'Confirmation required' }, { status: 400 })
    }

    // Delete in correct order — children before parents
    await query('DELETE FROM daily_exercise_log WHERE user_id = $1', [userId])
    await query('DELETE FROM daily_food_log WHERE user_id = $1', [userId])
    await query('DELETE FROM streak_logs WHERE user_id = $1', [userId])
    await query('DELETE FROM weight_logs WHERE user_id = $1', [userId])
    await query('DELETE FROM daily_logs WHERE user_id = $1', [userId])
    await query('DELETE FROM skip_foods WHERE user_id = $1', [userId])
    await query('DELETE FROM must_eat_foods WHERE user_id = $1', [userId])
    await query('DELETE FROM exercise_plan WHERE user_id = $1', [userId])
    await query('DELETE FROM trainer_plan WHERE user_id = $1', [userId])
    await query('DELETE FROM push_subscriptions WHERE user_id = $1', [userId])
    // Delete user last — after all referencing rows are gone
    await query('DELETE FROM users WHERE id = $1', [userId])

    cookieStore.delete('user_id')
    cookieStore.delete('auth')

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('RESET ERROR:', err.message)
    return NextResponse.json({ error: err.message ?? 'Reset failed' }, { status: 500 })
  }
}