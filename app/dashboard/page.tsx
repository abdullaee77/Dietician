'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getDayNumber } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import RunningTicker from '@/components/RunningTicker'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [progress, setProgress] = useState<any>(null)
  const [todayLog, setTodayLog] = useState<any>(null)
  const [plan, setPlan] = useState<any>(null)
  const [streakData, setStreakData] = useState<any[]>([])
  const [periodDays, setPeriodDays] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    Promise.all([
      fetch('/api/daily-log').then(r => {
        if (r.status === 401) { router.push('/login'); return null }
        return r.json()
      }),
      fetch('/api/progress').then(r => r.json()),
      fetch('/api/streak-graph').then(r => r.json()),
      fetch('/api/trainer/plan').then(r => r.json()),
      fetch('/api/period').then(r => r.json()),
    ]).then(([logData, progressData, streakRes, planData, periodData]) => {
      if (!logData) return
      setUser(logData.user)
      setTodayLog(logData.log)
      setProgress(progressData)
      setPlan(planData.plan)
      setPeriodDays(periodData.periodDays ?? [])

    const raw = streakRes.streakData ?? []
setStreakData(raw.slice(-14).map((d: any) => ({
  date: format(parseISO(d.date), 'MMM d'),
  displayValue: d.completed ? 1 : 0.15,
  completed: d.completed,
})))

      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <p className="text-zinc-500">Loading...</p>
      </div>
    )
  }

  const dayNumber = user ? getDayNumber(user.created_at) : 1
  const latestWeight = progress?.weights?.slice(-1)[0]?.weight_kg
  const todayDone = todayLog?.completed

  const weightInterval = plan?.weight_interval_days ?? 3
  const daysUntilWeight = weightInterval - (dayNumber % weightInterval)
  const isWeightDayToday = dayNumber % weightInterval === 0

  const isOnPeriod = periodDays.some(d =>
    new Date(d).toDateString() === new Date().toDateString()
  )

  // Build ticker messages
  const tickerMessages: string[] = []

  if (!todayDone) {
    tickerMessages.push("📝 You haven't filled today's plan yet — tap below to fill it!")
  }

  if (isWeightDayToday) {
    tickerMessages.push("⚖️ Today is Weight Day! Don't forget to log your weight")
  } else if (daysUntilWeight === 1) {
    tickerMessages.push("⚖️ Weight Day is tomorrow — get ready!")
  } else {
    tickerMessages.push(`⚖️ ${daysUntilWeight} days left until your next Weight Day`)
  }

tickerMessages.push("🩸 Mark your period days on time to keep proper track")

  return (
    <div className="min-h-screen bg-[#0f0f0f]">

      {/* Navbar */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="max-w-lg mx-auto">
          <p className="text-xs text-zinc-500">Day {dayNumber}</p>
          <h1 className="text-lg font-bold text-white">Welcome back, {user?.name} 🌸</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Running ticker headline */}
        <RunningTicker messages={tickerMessages} />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 text-center">
            <p className="text-2xl font-bold text-orange-400">{progress?.streak ?? 0}</p>
            <p className="text-xs text-zinc-500 mt-1">🔥 Streak</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 text-center">
            <p className="text-2xl font-bold text-rose-400">{progress?.totalDays ?? 0}</p>
            <p className="text-xs text-zinc-500 mt-1">📅 Days</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 text-center">
            <p className="text-2xl font-bold text-purple-400">
              {latestWeight ? `${latestWeight}kg` : '—'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">⚖️ Weight</p>
          </div>
        </div>

        {/* Streak graph */}
      
{streakData.length > 0 && (
  <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
    <h2 className="font-semibold text-white mb-1">🔥 Daily Submit Streak</h2>
    <p className="text-xs text-zinc-500 mb-3">Last 14 days</p>
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={streakData} barSize={16}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 9, fill: '#71717a' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#18181b',
            border: '1px solid #3f3f46',
            borderRadius: '10px',
            color: '#f4f4f5',
            fontSize: 11,
          }}
          formatter={(_value: any, _name: any, props: any) =>
            [props.payload.completed ? 'Filled ✅' : 'Missed ✗', '']
          }
          labelFormatter={(label) => label}
        />
        <Bar dataKey="displayValue" radius={[4, 4, 0, 0]}>
          {streakData.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.completed ? '#f43f5e' : '#3f3f46'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    <div className="flex gap-4 mt-2 text-xs text-zinc-500">
      <span className="flex items-center gap-1">
        <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" /> Filled
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2.5 h-2.5 rounded bg-zinc-700 inline-block" /> Missed
      </span>
    </div>
  </div>
)}
        {/* Today card */}
        <div className={`rounded-2xl p-5 border ${
          todayDone ? 'bg-green-500/10 border-green-500/20' : 'bg-zinc-900 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-zinc-400">{format(new Date(), 'EEEE, MMMM d')}</p>
            {todayDone && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-medium">
                ✓ Completed
              </span>
            )}
          </div>
          <h2 className="text-white font-semibold text-lg mb-4">
            {todayDone ? "Today's log is done 🎉" : "Fill your today's plan"}
          </h2>
          <button
            onClick={() => router.push('/home')}
            className={`w-full py-4 rounded-2xl text-white font-bold text-lg active:scale-95 transition ${
              todayDone ? 'bg-zinc-700' : 'bg-rose-500'
            }`}
          >
            {todayDone ? "Edit Today's Log" : "Fill Today's Plan →"}
          </button>
        </div>

        {/* Nav cards */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/progress')}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-left active:scale-95 transition hover:border-rose-500/30"
          >
            <p className="text-2xl mb-2">📈</p>
            <p className="text-white font-semibold text-sm">Progress</p>
            <p className="text-zinc-500 text-xs mt-1">Charts & streaks</p>
          </button>
          <button
            onClick={() => router.push('/plan')}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-left active:scale-95 transition hover:border-rose-500/30"
          >
            <p className="text-2xl mb-2">📋</p>
            <p className="text-white font-semibold text-sm">My Plan</p>
            <p className="text-zinc-500 text-xs mt-1">Foods & targets</p>
          </button>
        </div>

        <button
          onClick={() => router.push('/period')}
          className="w-full bg-zinc-900 border border-purple-500/20 rounded-2xl p-4 text-left active:scale-95 transition hover:border-purple-500/40"
        >
          <p className="text-2xl mb-2">🩸</p>
          <p className="text-white font-semibold text-sm">Period Tracker</p>
          <p className="text-zinc-500 text-xs mt-1">Log when your period starts and ends</p>
        </button>
   <div className="pt-4 space-y-2">
          <button
            onClick={async () => {
              await fetch('/api/logout', { method: 'POST' })
              router.push('/welcome')
            }}
            className="w-full py-3 rounded-2xl border border-zinc-800 text-zinc-500 text-sm font-medium hover:border-zinc-600 hover:text-zinc-300 transition"
          >
            Log Out
          </button>
          <button
            onClick={() => router.push('/reset')}
            className="w-full py-3 rounded-2xl border border-zinc-800 text-zinc-600 text-sm font-medium hover:border-red-500/30 hover:text-red-400 transition"
          >
            Reset Everything
          </button>
        </div>
      </div>
    </div>
  )
}