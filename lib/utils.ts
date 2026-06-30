import { differenceInCalendarDays, startOfDay, parseISO } from 'date-fns'

export function getDayNumber(createdAt: string | Date): number {
  const created = startOfDay(
    typeof createdAt === 'string' ? parseISO(createdAt) : createdAt
  )
  const now = startOfDay(new Date())
  return differenceInCalendarDays(now, created) + 1
}

export function shouldShowWeight(dayNumber: number, intervalDays: number = 3): boolean {
  return dayNumber % intervalDays === 0
}

export function shouldShowMeasurements(dayNumber: number, intervalDays: number = 7): boolean {
  return dayNumber % intervalDays === 0
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}