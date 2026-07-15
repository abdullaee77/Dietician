import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const auth = cookieStore.get('auth')?.value
  const userId = cookieStore.get('user_id')?.value

  if (auth !== 'true' || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { confirm } = await req.json()
  if (confirm !== 'RESET') {
    return NextResponse.json({ error: 'Confirmation required' }, { status: 400 })
  }

  // Only delete THIS user's data
  await query('DELETE FROM daily_food_log WHERE user_id = $1', [userId])
  await query('DELETE FROM daily_exercise_log WHERE user_id = $1', [userId])
  await query('DELETE FROM streak_logs WHERE user_id = $1', [userId])
  await query('DELETE FROM period_logs WHERE user_id = $1', [userId])
  await query('DELETE FROM weight_logs WHERE user_id = $1', [userId])
  await query('DELETE FROM daily_logs WHERE user_id = $1', [userId])
  await query('DELETE FROM users WHERE id = $1', [userId])

  // Clear cookies
  cookieStore.delete('user_id')
  cookieStore.delete('auth')

  return NextResponse.json({ success: true })
}