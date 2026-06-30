import { differenceInCalendarDays } from 'date-fns'

// Pakistan is always UTC+5, no daylight saving — safe to hardcode
const PAKISTAN_OFFSET_MS = 5 * 60 * 60 * 1000

function toPakistanTime(date: Date): Date {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60 * 1000
  return new Date(utcMs + PAKISTAN_OFFSET_MS)
}

export function getDayNumber(createdAt: string | Date): number {
  const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt

  const createdPK = toPakistanTime(created)
  const nowPK = toPakistanTime(new Date())

  const createdLocal = new Date(createdPK.getFullYear(), createdPK.getMonth(), createdPK.getDate())
  const nowLocal = new Date(nowPK.getFullYear(), nowPK.getMonth(), nowPK.getDate())

  const diff = differenceInCalendarDays(nowLocal, createdLocal)
  return Math.max(diff + 1, 1)
}

export function shouldShowWeight(dayNumber: number, intervalDays: number = 3): boolean {
  return dayNumber % intervalDays === 0
}

export function todayISO(): string {
  const pk = toPakistanTime(new Date())
  const year = pk.getFullYear()
  const month = String(pk.getMonth() + 1).padStart(2, '0')
  const day = String(pk.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}