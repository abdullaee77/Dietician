import { differenceInCalendarDays, parseISO } from 'date-fns'

export function getDayNumber(createdAt: string | Date): number {
  const created = typeof createdAt === 'string' ? parseISO(createdAt) : createdAt

  // Normalize both to local YYYY-MM-DD, ignoring time/timezone entirely
  const createdLocal = new Date(
    created.getFullYear(),
    created.getMonth(),
    created.getDate()
  )
  const now = new Date()
  const nowLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const diff = differenceInCalendarDays(nowLocal, createdLocal)
  return Math.max(diff + 1, 1) // never go below Day 1
}

export function shouldShowWeight(dayNumber: number, intervalDays: number = 3): boolean {
  return dayNumber % intervalDays === 0
}



export function todayISO(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}