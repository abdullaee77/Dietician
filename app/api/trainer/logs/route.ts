import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  const users = await query(`SELECT id, name, created_at FROM users ORDER BY id`)

  if (users.length === 0) return NextResponse.json({ user: null, logs: [] })

  const user = users[0]

  const logs = await query(
    `SELECT * FROM daily_logs WHERE user_id = $1 ORDER BY date DESC LIMIT 30`,
    [user.id]
  )

  const weights = await query(
    `SELECT date, weight_kg FROM weight_logs WHERE user_id = $1 ORDER BY date DESC`,
    [user.id]
  )



  return NextResponse.json({ user, logs, weights})
}