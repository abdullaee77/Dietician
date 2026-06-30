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

  const rows = await query(
    `SELECT date FROM period_logs WHERE user_id = $1 ORDER BY date ASC`,
    [userId]
  )

  return NextResponse.json({ periodDays: rows.map(r => r.date) })
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { date, startDate, endDate, remove } = await req.json()

  if (date) {
    if (remove) {
      await query(`DELETE FROM period_logs WHERE user_id = $1 AND date = $2`, [userId, date])
    } else {
      await query(
        `INSERT INTO period_logs (user_id, date) VALUES ($1, $2)
         ON CONFLICT (user_id, date) DO NOTHING`,
        [userId, date]
      )
    }
    return NextResponse.json({ success: true })
  }

  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const dates: string[] = []
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0])
    }
    for (const d of dates) {
      await query(
        `INSERT INTO period_logs (user_id, date) VALUES ($1, $2)
         ON CONFLICT (user_id, date) DO NOTHING`,
        [userId, d]
      )
    }
    return NextResponse.json({ success: true, daysAdded: dates.length })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { startDate, endDate } = await req.json()

  await query(
    `DELETE FROM period_logs WHERE user_id = $1 AND date >= $2 AND date <= $3`,
    [userId, startDate, endDate]
  )

  return NextResponse.json({ success: true })
}