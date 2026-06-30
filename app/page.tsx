import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { query } from '@/lib/db'

export default async function RootPage() {
  const cookieStore = await cookies()
  const authed = cookieStore.get('auth')?.value
  const userId = cookieStore.get('user_id')?.value

  if (authed === 'true' && userId) {
    const rows = await query(
      'SELECT id, initial_weight_logged FROM users WHERE id = $1',
      [userId]
    )
    if (rows.length > 0) {
      if (!rows[0].initial_weight_logged) redirect('/initial-weight')
      redirect('/dashboard')
    }
  }

  redirect('/welcome')
}