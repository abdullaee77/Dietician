'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell
} from 'recharts'
import { format, parseISO } from 'date-fns'
import StreakBadge from '@/components/StreakBadge'

const tooltipStyle = {
  backgroundColor: '#18181b',
  border: '1px solid #3f3f46',
  borderRadius: '12px',
  color: '#f4f4f5',
  fontSize: 12,
}

function timeToDecimal(t: string): number | null {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}

function formatHour(val: number): string {
  const h = Math.floor(val)
  const m = Math.round((val - h) * 60)
  const period = h >= 12 ? 'PM' : 'AM'
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`
}

export default function ProgressPage() {
  const [data, setData] = useState<any>(null)
  const [periodDays, setPeriodDays] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/progress').then(r => {
      if (r.status === 401) { router.push('/login'); return null }
      return r.json()
    }).then(d => {
      if (!d) return
      setData(d)
      setPeriodDays(d.periodDays ?? [])
      setLoading(false)
    })
  }, [router])

  function isPeriodDay(dateStr: string): boolean {
    return periodDays.some(d => {
      const a = new Date(d); const b = new Date(dateStr)
      return a.toDateString() === b.toDateString()
    })
  }

  async function togglePeriodDay(dateStr: string) {
    const isOn = isPeriodDay(dateStr)
    await fetch('/api/period', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateStr, remove: isOn }),
    })
    if (isOn) {
      setPeriodDays(prev => prev.filter(d =>
        new Date(d).toDateString() !== new Date(dateStr).toDateString()
      ))
    } else {
      setPeriodDays(prev => [...prev, dateStr])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <p className="text-zinc-500">Loading...</p>
      </div>
    )
  }

  const weightData = (data.weights ?? []).map((w: any) => ({
    date: format(parseISO(w.date), 'MMM d'),
    rawDate: w.date,
    weight: Number(w.weight_kg),
    isPeriod: isPeriodDay(w.date),
  }))

  const waterData = (data.waterData ?? []).slice(-14).map((w: any) => ({
    date: format(parseISO(w.date), 'MMM d'),
    glasses: w.glasses,
  }))

  const mealTimesData = (data.mealTimesData ?? []).slice(-14).map((m: any) => ({
    date: format(parseISO(m.date), 'MMM d'),
    breakfast: timeToDecimal(m.breakfast),
    lunch: timeToDecimal(m.lunch),
    dinner: timeToDecimal(m.dinner),
  })).filter((m: any) => m.breakfast || m.lunch || m.dinner)

  const sleepData = (data.sleepData ?? []).slice(-14).map((s: any) => ({
    date: format(parseISO(s.date), 'MMM d'),
    hours: s.hours,
  }))

  const submitData = data.submitData ?? []

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-24">
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">📈 Progress</h1>
          <button onClick={() => router.push('/dashboard')}
            className="text-rose-400 font-medium text-sm">← Home</button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* Streaks */}
        <div className="grid grid-cols-2 gap-3">
          <StreakBadge label="Day Streak" emoji="🔥" count={data.streak} color="bg-zinc-900 text-orange-400" />
          <StreakBadge label="Total Days" emoji="📅" count={data.totalDays} color="bg-zinc-900 text-rose-400" />
        </div>

        {/* Submit streak calendar */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <h2 className="font-semibold text-white mb-4">📆 Submit Streak</h2>
          <div className="grid grid-cols-10 gap-1.5">
            {submitData.map((d: any) => (
              <div
                key={d.date}
                title={format(parseISO(d.date), 'MMM d')}
                className={`w-full aspect-square rounded-md ${
                  d.completed ? 'bg-rose-500' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-rose-500 inline-block" /> Completed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-zinc-800 inline-block" /> Missed
            </span>
          </div>
        </div>

        {/* Weight chart */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-white">⚖️ Weight (kg)</h2>
            <div className="flex gap-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Normal
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" /> Period
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-600 mb-3">Tap a date to mark/unmark period days</p>

          {weightData.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-zinc-600">
              <p className="text-4xl mb-2">⚖️</p>
              <p className="text-sm">No weight entries yet</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717a' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#71717a' }} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    dot={(props: any) => {
                      const { cx, cy, payload } = props
                      return (
                        <circle
                          key={payload.date}
                          cx={cx} cy={cy} r={5}
                          fill={payload.isPeriod ? '#a855f7' : '#f43f5e'}
                          stroke={payload.isPeriod ? '#7c3aed' : '#be123c'}
                          strokeWidth={1.5}
                        />
                      )
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="flex flex-wrap gap-2 mt-3">
                {weightData.map((w: any) => (
                  <button
                    key={w.rawDate}
                    onClick={() => togglePeriodDay(w.rawDate)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition active:scale-95 ${
                      w.isPeriod
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                    }`}
                  >
                    {w.date} {w.isPeriod ? '🩸' : ''}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Water chart */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <h2 className="font-semibold text-white mb-4">💧 Water Intake</h2>
          {waterData.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-zinc-600">
              <p className="text-4xl mb-2">💧</p>
              <p className="text-sm">No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={waterData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} domain={[0, 12]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="glasses" radius={[6, 6, 0, 0]}>
                  {waterData.map((entry: any, i: number) => (
                    <Cell key={i}
                      fill={entry.glasses >= 8 ? '#3b82f6' : '#1d4ed8'}
                      opacity={entry.glasses >= 8 ? 1 : 0.5}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <p className="text-xs text-zinc-600 mt-2">Bright = 8+ glasses ✓</p>
        </div>

        {/* Meal times chart */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <h2 className="font-semibold text-white mb-4">🍽️ Meal Times</h2>
          {mealTimesData.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-zinc-600">
              <p className="text-4xl mb-2">🍽️</p>
              <p className="text-sm">No meal time data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mealTimesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#71717a' }}
                  domain={[6, 23]}
                  tickFormatter={formatHour}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val: any) => val ? formatHour(val) : 'Skipped'}
                />
                <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: 12 }} />
                <Line type="monotone" dataKey="breakfast" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
                <Line type="monotone" dataKey="lunch" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
                <Line type="monotone" dataKey="dinner" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sleep chart */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <h2 className="font-semibold text-white mb-4">😴 Sleep Hours</h2>
          {sleepData.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-zinc-600">
              <p className="text-4xl mb-2">😴</p>
              <p className="text-sm">No sleep data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sleepData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} domain={[0, 12]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                  {sleepData.map((entry: any, i: number) => (
                    <Cell key={i}
                      fill={entry.hours >= 7 ? '#8b5cf6' : '#4c1d95'}
                      opacity={entry.hours >= 7 ? 1 : 0.5}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <p className="text-xs text-zinc-600 mt-2">Bright = 7+ hours ✓</p>
        </div>

      </div>
    </div>
  )
}