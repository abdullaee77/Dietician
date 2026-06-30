'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { todayISO } from '@/lib/utils'

export default function PeriodPage() {
  const [periodDays, setPeriodDays] = useState<string[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingRange, setDeletingRange] = useState<{ start: string; end: string } | null>(null)
  const router = useRouter()
  const today = todayISO()

  useEffect(() => {
    fetch('/api/period')
      .then(r => r.json())
      .then(d => {
        setPeriodDays(d.periodDays ?? [])
        setLoading(false)
      })
  }, [])

  const isTodayMarked = periodDays.some(d =>
    new Date(d).toDateString() === new Date(today).toDateString()
  )

  async function refreshPeriods() {
    const res = await fetch('/api/period')
    const d = await res.json()
    setPeriodDays(d.periodDays ?? [])
  }

  async function toggleToday() {
    await fetch('/api/period', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, remove: isTodayMarked }),
    })
    await refreshPeriods()
  }

  async function logRange() {
    if (!startDate || !endDate) return
    setSaving(true)
    await fetch('/api/period', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate }),
    })
    await refreshPeriods()
    setStartDate('')
    setEndDate('')
    setSaving(false)
  }

  async function confirmDeleteRange() {
    if (!deletingRange) return
    await fetch('/api/period', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: deletingRange.start, endDate: deletingRange.end }),
    })
    await refreshPeriods()
    setDeletingRange(null)
  }

  // Group consecutive days into ranges
  const sortedDays = [...periodDays].sort()
  const ranges: { start: string; end: string }[] = []
  let rangeStart: string | null = null
  let prevDate: Date | null = null

  for (const d of sortedDays) {
    const current = new Date(d)
    if (!rangeStart) {
      rangeStart = d
    } else if (prevDate && (current.getTime() - prevDate.getTime()) > 86400000 * 1.5) {
      ranges.push({ start: rangeStart, end: format(prevDate, 'yyyy-MM-dd') })
      rangeStart = d
    }
    prevDate = current
  }
  if (rangeStart && prevDate) {
    ranges.push({ start: rangeStart, end: format(prevDate, 'yyyy-MM-dd') })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <p className="text-zinc-500">Loading...</p>
      </div>
    )
  }

  const inputCls = "w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-24">
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">🩸 Period Tracker</h1>
          <button onClick={() => router.push('/dashboard')} className="text-rose-400 font-medium text-sm">← Home</button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Quick toggle for today */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-purple-500/20">
          <h2 className="font-semibold text-white mb-1">Today</h2>
          <p className="text-zinc-500 text-xs mb-3">{format(new Date(), 'EEEE, MMMM d')}</p>
          <button
            onClick={toggleToday}
            className={`w-full py-3 rounded-2xl font-semibold transition active:scale-95 ${
              isTodayMarked
                ? 'bg-purple-500 text-white'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}
          >
            {isTodayMarked ? '🩸 Marked as period day — tap to unmark' : 'Mark today as period day'}
          </button>
        </div>

        {/* Range picker for past periods */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <h2 className="font-semibold text-white mb-3">Log a Past Period</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">End date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <button
            onClick={logRange}
            disabled={saving || !startDate || !endDate}
            className="w-full py-3 rounded-2xl bg-purple-500 text-white font-semibold disabled:opacity-40 active:scale-95 transition"
          >
            {saving ? 'Saving...' : 'Log This Period'}
          </button>
        </div>

        {/* History with delete */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <h2 className="font-semibold text-white mb-3">History</h2>
          {ranges.length === 0 ? (
            <p className="text-zinc-600 text-sm">No periods logged yet</p>
          ) : (
            <div className="space-y-2">
              {ranges.slice().reverse().map((r, i) => (
                <div key={i} className="bg-purple-500/10 rounded-xl px-3 py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm">
                      {format(parseISO(r.start), 'MMM d')}
                      {r.start !== r.end && ` – ${format(parseISO(r.end), 'MMM d')}`}
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {Math.round((new Date(r.end).getTime() - new Date(r.start).getTime()) / 86400000) + 1} days
                    </p>
                  </div>
                  <button
                    onClick={() => setDeletingRange(r)}
                    className="text-red-400 text-xs font-medium px-2 py-1 rounded-lg hover:bg-red-500/10 transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Delete confirmation modal */}
      {deletingRange && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-6 z-50">
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-700 max-w-sm w-full">
            <p className="text-white font-semibold mb-1">Delete this period?</p>
            <p className="text-zinc-500 text-sm mb-4">
              {format(parseISO(deletingRange.start), 'MMM d')}
              {deletingRange.start !== deletingRange.end && ` – ${format(parseISO(deletingRange.end), 'MMM d')}`}
              {' '}will be removed from your history.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingRange(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-medium active:scale-95 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteRange}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold active:scale-95 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}