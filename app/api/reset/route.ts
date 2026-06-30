import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const auth = cookieStore.get('auth')?.value
  if (auth !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { confirm } = await req.json()
  if (confirm !== 'RESET') {
    return NextResponse.json({ error: 'Confirmation required' }, { status: 400 })
  }

  // Wipe everything — including the PIN, since it lives on users
  await query('DELETE FROM daily_food_log')
  await query('DELETE FROM streak_logs')
  await query('DELETE FROM period_logs')
  await query('DELETE FROM weight_logs')
  await query('DELETE FROM daily_logs')
  await query('DELETE FROM users')          // <-- this removes the old PIN
  await query('DELETE FROM skip_foods')
  await query('DELETE FROM must_eat_foods')
  await query('DELETE FROM trainer_plan')

  // Clear session cookies so no stale login persists
  cookieStore.delete('user_id')
  cookieStore.delete('auth')

  return NextResponse.json({ success: true })
}