
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getDayNumber, shouldShowWeight } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import RunningTicker from '@/components/RunningTicker'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [progress, setProgress] = useState<any>(null)
  const [todayLog, setTodayLog] = useState<any>(null)
  const [plan, setPlan] = useState<any>(null)
  const [streakData, setStreakData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isWeightDay, setIsWeightDay] = useState(false)
  const [weightExpanded, setWeightExpanded] = useState(false)
  const [weightInput, setWeightInput] = useState('')
  const [weightSaved, setWeightSaved] = useState(false)
  const [todayWeight, setTodayWeight] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (weightExpanded) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [weightExpanded])

  async function subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    try {
      const registration = await navigator.serviceWorker.ready
      const existing = await registration.pushManager.getSubscription()
      if (existing) {
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(existing)
        })
        return
      }
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      })
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      })
    } catch (err) {
      console.error('Push subscription failed:', err)
    }
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/daily-log').then(r => {
        if (r.status === 401) { router.push('/login'); return null }
        return r.json()
      }),
      fetch('/api/progress').then(r => r.json()),
      fetch('/api/streak-graph').then(r => r.json()),
      fetch('/api/trainer/plan').then(r => r.json()),
      fetch('/api/weight').then(r => r.json()),
    ]).then(([logData, progressData, streakRes, planData, weightData]) => {
      if (!logData) return
      setUser(logData.user)
      setTodayLog(logData.log)
      setProgress(progressData)
      setPlan(planData.plan)
      setTodayWeight(weightData.todayWeight)

      const raw = streakRes.streakData ?? []
      setStreakData(raw.slice(-14).map((d: any) => ({
        date: format(parseISO(d.date), 'MMM d'),
        displayValue: d.completed ? 1 : 0.15,
        completed: d.completed,
      })))

      const dn = getDayNumber(logData.user.created_at)
      const interval = planData.plan?.weight_interval_days ?? 3
      const weightDay = shouldShowWeight(dn, interval)
      setIsWeightDay(weightDay)

      setLoading(false)
      subscribeToPush()
    })
  }, [router])

  async function handleWeightSave() {
    if (!weightInput) return
    await fetch('/api/weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight_kg: parseFloat(weightInput) }),
    })
    setTodayWeight(parseFloat(weightInput))
    setWeightSaved(true)
    setTimeout(() => {
      setWeightExpanded(false)
      setWeightSaved(false)
    }, 1200)
  }

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-[#0f0f0f] animate-pulse">
  //       {/* Skeleton Navbar */}
  //       <div className="bg-zinc-900/60 border-b border-zinc-850 px-6 py-4">
  //         <div className="max-w-lg mx-auto space-y-2">
  //           <div className="h-3.5 w-12 bg-zinc-800 rounded" />
  //           <div className="h-5 w-48 bg-zinc-800 rounded" />
  //         </div>
  //       </div>

  //       <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
  //         {/* Skeleton Ticker */}
  //         <div className="h-8 bg-zinc-900 rounded-xl" />

  //         {/* Skeleton Stats Grid */}
  //         <div className="grid grid-cols-3 gap-2">
  //           <div className="bg-zinc-900 rounded-2xl p-4 h-20 flex flex-col justify-center items-center">
  //             <div className="h-6 w-8 bg-zinc-800 rounded mb-2" />
  //             <div className="h-3 w-12 bg-zinc-800 rounded" />
  //           </div>
  //           <div className="bg-zinc-900 rounded-2xl p-4 h-20 flex flex-col justify-center items-center">
  //             <div className="h-6 w-8 bg-zinc-800 rounded mb-2" />
  //             <div className="h-3 w-12 bg-zinc-800 rounded" />
  //           </div>
  //           <div className="bg-zinc-900 rounded-2xl p-4 h-20 flex flex-col justify-center items-center">
  //             <div className="h-6 w-12 bg-zinc-800 rounded mb-2" />
  //             <div className="h-3 w-12 bg-zinc-800 rounded" />
  //           </div>
  //         </div>

  //         {/* Skeleton Streak graph */}
  //         <div className="bg-zinc-900 rounded-2xl p-4 h-[208px] flex flex-col justify-between">
  //           <div>
  //             <div className="h-4 w-40 bg-zinc-800 rounded mb-2" />
  //             <div className="h-3 w-20 bg-zinc-800 rounded" />
  //           </div>
  //           <div className="h-24 w-full bg-zinc-900/50 flex items-end gap-1.5 px-2">
  //             {Array.from({ length: 14 }).map((_, i) => (
  //               <div key={i} className="flex-1 bg-zinc-800 rounded-t h-12" />
  //             ))}
  //           </div>
  //           <div className="flex gap-4">
  //             <div className="h-3 w-12 bg-zinc-800 rounded" />
  //             <div className="h-3 w-12 bg-zinc-800 rounded" />
  //           </div>
  //         </div>

  //         {/* Skeleton Today card */}
  //         <div className="bg-zinc-900 rounded-2xl p-5 h-[148px] flex flex-col justify-between">
  //           <div className="flex justify-between items-center">
  //             <div className="h-3.5 w-32 bg-zinc-800 rounded" />
  //             <div className="h-5 w-20 bg-zinc-800 rounded-full" />
  //           </div>
  //           <div className="h-5 w-44 bg-zinc-800 rounded mt-2" />
  //           <div className="h-12 w-full bg-zinc-800 rounded-2xl mt-4" />
  //         </div>

  //         {/* Skeleton Nav cards */}
  //         <div className="grid grid-cols-2 gap-3">
  //           <div className="bg-zinc-900 rounded-2xl p-4 h-28">
  //             <div className="h-8 w-8 bg-zinc-800 rounded-lg mb-2" />
  //             <div className="h-4 w-16 bg-zinc-800 rounded mb-1" />
  //             <div className="h-3 w-24 bg-zinc-800 rounded" />
  //           </div>
  //           <div className="bg-zinc-900 rounded-2xl p-4 h-28">
  //             <div className="h-8 w-8 bg-zinc-800 rounded-lg mb-2" />
  //             <div className="h-4 w-16 bg-zinc-800 rounded mb-1" />
  //             <div className="h-3 w-24 bg-zinc-800 rounded" />
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] animate-pulse">
        {/* Skeleton Navbar (Border Removed) */}
        <div className="bg-zinc-900/60 px-6 py-4">
          <div className="max-w-lg mx-auto space-y-2">
            <div className="h-3.5 w-12 bg-zinc-800 rounded" />
            <div className="h-5 w-48 bg-zinc-800 rounded" />
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
          {/* Skeleton Ticker */}
          <div className="h-8 bg-zinc-900 rounded-xl" />

          {/* Skeleton Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-zinc-900 rounded-2xl p-4 h-20 flex flex-col justify-center items-center">
              <div className="h-6 w-8 bg-zinc-800 rounded mb-2" />
              <div className="h-3 w-12 bg-zinc-800 rounded" />
            </div>
            <div className="bg-zinc-900 rounded-2xl p-4 h-20 flex flex-col justify-center items-center">
              <div className="h-6 w-8 bg-zinc-800 rounded mb-2" />
              <div className="h-3 w-12 bg-zinc-800 rounded" />
            </div>
            <div className="bg-zinc-900 rounded-2xl p-4 h-20 flex flex-col justify-center items-center">
              <div className="h-6 w-12 bg-zinc-800 rounded mb-2" />
              <div className="h-3 w-12 bg-zinc-800 rounded" />
            </div>
          </div>

          {/* Skeleton Streak graph */}
          <div className="bg-zinc-900 rounded-2xl p-4 h-[208px] flex flex-col justify-between">
            <div>
              <div className="h-4 w-40 bg-zinc-800 rounded mb-2" />
              <div className="h-3 w-20 bg-zinc-800 rounded" />
            </div>
            <div className="h-24 w-full bg-zinc-900/50 flex items-end gap-1.5 px-2">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="flex-1 bg-zinc-800 rounded-t h-12" />
              ))}
            </div>
            <div className="flex gap-4">
              <div className="h-3 w-12 bg-zinc-800 rounded" />
              <div className="h-3 w-12 bg-zinc-800 rounded" />
            </div>
          </div>

          {/* Skeleton Today card */}
          <div className="bg-zinc-900 rounded-2xl p-5 h-[148px] flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-32 bg-zinc-800 rounded" />
              <div className="h-5 w-20 bg-zinc-800 rounded-full" />
            </div>
            <div className="h-5 w-44 bg-zinc-800 rounded mt-2" />
            <div className="h-12 w-full bg-zinc-800 rounded-2xl mt-4" />
          </div>

          {/* Skeleton Nav cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900 rounded-2xl p-4 h-28">
              <div className="h-8 w-8 bg-zinc-800 rounded-lg mb-2" />
              <div className="h-4 w-16 bg-zinc-800 rounded mb-1" />
              <div className="h-3 w-24 bg-zinc-800 rounded" />
            </div>
            <div className="bg-zinc-900 rounded-2xl p-4 h-28">
              <div className="h-8 w-8 bg-zinc-800 rounded-lg mb-2" />
              <div className="h-4 w-16 bg-zinc-800 rounded mb-1" />
              <div className="h-3 w-24 bg-zinc-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }
  const dayNumber = user ? getDayNumber(user.created_at) : 1
  const latestWeight = progress?.weights?.slice(-1)[0]?.weight_kg
  const todayDone = todayLog?.completed

  const weightInterval = plan?.weight_interval_days ?? 3
  const daysUntilWeight = weightInterval - (dayNumber % weightInterval)
  const isWeightDayToday = dayNumber % weightInterval === 0

  const tickerMessages: string[] = []
  if (!todayDone) {
    tickerMessages.push("📝 You haven't filled today's plan yet — tap below to fill it!")
  }
  if (isWeightDayToday) {
    tickerMessages.push("⚖️ Today is Weight Day! Tap your weight card to log it")
  } else if (daysUntilWeight === 1) {
    tickerMessages.push("⚖️ Weight Day is tomorrow — get ready!")
  } else {
    tickerMessages.push(`⚖️ ${daysUntilWeight} days left until your next Weight Day`)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] relative">
      <style jsx global>{`
        @keyframes gradient-border-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes glowing-shine {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.4)) drop-shadow(0 0 10px rgba(249, 115, 22, 0.2)); }
          50% { filter: drop-shadow(0 0 10px rgba(249, 115, 22, 0.7)) drop-shadow(0 0 20px rgba(239, 68, 68, 0.4)); }
        }
        .animate-red-orange-flow {
          background-size: 200% 200%;
          animation: gradient-border-flow 3s ease infinite;
        }
        .animate-glow-shine {
          animation: glowing-shine 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* Navbar */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="max-w-lg mx-auto">
          <p className="text-xs text-zinc-500">Day {dayNumber}</p>
          <h1 className="text-lg font-bold text-white">Welcome back, {user?.name} 🌸</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Ticker */}
        <RunningTicker messages={tickerMessages} />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 items-stretch">
          <div className="bg-zinc-900 rounded-2xl p-3 border border-zinc-800 flex flex-col justify-center items-center text-center min-w-0">
            <p className="text-lg sm:text-2xl font-bold text-orange-400 truncate">{progress?.streak ?? 0}</p>
            <p className="text-[10px] sm:text-xs text-zinc-500 mt-1 truncate">🔥 Streak</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-3 border border-zinc-800 flex flex-col justify-center items-center text-center min-w-0">
            <p className="text-lg sm:text-2xl font-bold text-rose-400 truncate">{progress?.totalDays ?? 0}</p>
            <p className="text-[10px] sm:text-xs text-zinc-500 mt-1 truncate">📅 Days</p>
          </div>

          {/* Weight card */}
          <div className="relative rounded-2xl min-w-0 w-full h-full flex flex-col justify-stretch">
            {isWeightDay ? (
              <>
                <div 
                  onClick={() => setWeightExpanded(true)}
                  className="absolute inset-0 rounded-2xl p-[1.5px] animate-red-orange-flow animate-glow-shine bg-gradient-to-r from-red-500 via-orange-500 to-red-500 cursor-pointer active:scale-95 transition"
                >
                  <div className="h-full w-full bg-zinc-950 hover:bg-zinc-900/95 rounded-[15px] p-3 flex flex-col justify-center items-center text-center transition-colors duration-200">
                    <p
                      className="font-bold whitespace-nowrap truncate bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"
                      style={{ fontSize: 'clamp(0.75rem, 4vw, 1.25rem)' }}
                    >
                      {todayWeight
                        ? `${todayWeight}kg`
                        : latestWeight
                          ? `${latestWeight}kg`
                          : '—'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-orange-400/90 mt-1 truncate font-semibold uppercase tracking-wider">
                      ⚖️ Weight
                    </p>
                  </div>
                </div>
                {/* Structural placeholder */}
                <div className="p-3 opacity-0 pointer-events-none select-none flex flex-col justify-center items-center">
                  <p style={{ fontSize: 'clamp(0.75rem, 4vw, 1.25rem)' }}>—</p>
                  <p className="text-[10px] sm:text-xs mt-1">—</p>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-col justify-center items-center text-center">
                <p
                  className="font-bold text-purple-400 whitespace-nowrap truncate"
                  style={{ fontSize: 'clamp(0.75rem, 4vw, 1.25rem)' }}
                >
                  {todayWeight
                    ? `${todayWeight}kg`
                    : latestWeight
                      ? `${latestWeight}kg`
                      : '—'}
                </p>
                <p className="text-[10px] sm:text-xs text-zinc-500 mt-1 truncate">
                  ⚖️ Weight
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Weight input floating card overlay */}
        {isWeightDay && weightExpanded && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div 
              className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setWeightExpanded(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 p-1"
              >
                ✕
              </button>
              
              <div className="text-center mb-5">
                <span className="text-3xl">⚖️</span>
                <h3 className="text-white font-bold text-lg mt-2">Log Today's Weight</h3>
                <p className="text-zinc-400 text-xs mt-1">Keep up the great progress!</p>
              </div>

              <input
                type="number"
                step="0.1"
                inputMode="decimal"
                autoFocus
                value={weightInput || (todayWeight ? String(todayWeight) : '')}
                onChange={e => setWeightInput(e.target.value)}
                placeholder="Weight in kg"
                className="w-full px-4 py-3 rounded-xl border border-zinc-850 bg-zinc-900 text-white text-base text-center placeholder-zinc-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition mb-4 box-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              <button
                onClick={handleWeightSave}
                disabled={!weightInput}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-sm disabled:opacity-40 active:scale-95 transition"
              >
                {weightSaved ? '✅ Weight Saved!' : todayWeight ? 'Update Weight' : 'Save Weight'}
              </button>
            </div>
          </div>
        )}

        {/* Streak graph */}
        {streakData.length > 0 && (
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <h2 className="font-semibold text-white mb-1">🔥 Daily Submit Streak</h2>
            <p className="text-xs text-zinc-500 mb-3">Last 14 days</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={streakData} barSize={16}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#71717a' }} axisLine={false} tickLine={false} />
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
                    <Cell key={i} fill={entry.completed ? '#f43f5e' : '#3f3f46'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" /> Filled
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-zinc-800 inline-block" /> Missed
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

        {/* Logout + Reset */}
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