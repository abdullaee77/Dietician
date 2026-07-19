
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

export default function HistoryPage() {
  const [historyMonth, setHistoryMonth] = useState(new Date())
  const [historyData, setHistoryData] = useState<any>({ logs: [], foodLogs: [], exerciseLogs: [] })
  const [selectedDay, setSelectedDay] = useState<any>(null)
  const [historyLoading, setHistoryLoading] = useState(true)
  const router = useRouter()

  async function fetchHistory(date: Date) {
    setHistoryLoading(true)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const res = await fetch(`/api/history?year=${year}&month=${month}`)
    if (res.status === 401) { router.push('/login'); return }
    const d = await res.json()
    setHistoryData(d)
    setHistoryLoading(false)
  }

  useEffect(() => {
    fetchHistory(new Date())
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedDay) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedDay])

  function getCalendarData(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  function getLogForDay(day: number): any {
    const year = historyMonth.getFullYear()
    const month = String(historyMonth.getMonth() + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    const dateStr = `${year}-${month}-${dayStr}`

    return historyData.logs?.find((l: any) => {
      const logDate = new Date(l.date)
      const lYear = logDate.getFullYear()
      const lMonth = String(logDate.getMonth() + 1).padStart(2, '0')
      const lDay = String(logDate.getDate()).padStart(2, '0')
      return `${lYear}-${lMonth}-${lDay}` === dateStr
    }) ?? null
  }

  function getDayExercises(dateStr: string) {
    return historyData.exerciseLogs?.filter((e: any) => {
      const d = new Date(e.date)
      const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      return str === dateStr
    }) ?? []
  }

  function getDayFoods(dateStr: string) {
    return historyData.foodLogs?.filter((f: any) => {
      const d = new Date(f.date)
      const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      return str === dateStr
    }) ?? []
  }

  // Live Metrics Calculations from real historyData state
  const totalLogsCount = historyData.logs?.length || 0
  const completedLogsCount = historyData.logs?.filter((l: any) => l.completed).length || 0
  const adherenceRate = totalLogsCount > 0 ? Math.round((completedLogsCount / totalLogsCount) * 100) : 0

  const totalStepsThisMonth = historyData.logs?.reduce((acc: number, curr: any) => acc + (curr.steps || 0), 0) || 0
  const maxStepsDay = historyData.logs?.reduce((max: number, curr: any) => (curr.steps > max ? curr.steps : max), 0) || 0
  const totalExercisesThisMonth = historyData.exerciseLogs?.length || 0

  const { firstDay, daysInMonth } = getCalendarData(historyMonth)
  const today = new Date()

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 pb-12 relative overflow-x-hidden">

      {/* Decorative subtle background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-900/80 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📊</span>
            <h1 className="text-base font-black text-white tracking-tight uppercase">Dashboard History</h1>
          </div>
          <button
            onClick={() => router.push('/progress')}
            className="text-zinc-400 hover:text-white font-semibold text-sm transition"
          >
            Back
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6 relative z-10">

        {/* SECTION 1: MONTH AT A GLANCE ANALYTICS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-black tracking-widest text-zinc-500 uppercase">Month Analytics</h3>
            <span className="text-[10px] font-bold text-rose-400 px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-full">
              Live Feed
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Adherence Rate */}
            <div className="bg-zinc-950 border border-zinc-900/80 rounded-2xl p-3.5 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 text-rose-500/10 text-3xl font-black">%</div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Adherence</p>
              <p className="text-xl font-black text-rose-500 mt-1">{adherenceRate}%</p>
              <div className="w-full bg-zinc-900 h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${adherenceRate}%` }} />
              </div>
            </div>

            {/* Total Steps */}
            <div className="bg-zinc-950 border border-zinc-900/80 rounded-2xl p-3.5 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-1 -translate-y-2 text-emerald-500/10 text-3xl font-black">👟</div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Steps</p>
              <p className="text-xl font-black text-emerald-400 mt-1">
                {totalStepsThisMonth >= 1000 ? `${(totalStepsThisMonth / 1000).toFixed(1)}k` : totalStepsThisMonth}
              </p>
              <p className="text-[9px] text-zinc-600 font-medium mt-1.5">This Month</p>
            </div>

            {/* Total Active Days */}
            <div className="bg-zinc-950 border border-zinc-900/80 rounded-2xl p-3.5 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-1 -translate-y-2 text-indigo-500/10 text-3xl font-black">🔥</div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Active Days</p>
              <p className="text-xl font-black text-indigo-400 mt-1">{completedLogsCount}/{totalLogsCount}</p>
              <p className="text-[9px] text-zinc-600 font-medium mt-1.5">Logged Total</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: CALENDAR CARD */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-black tracking-widest text-zinc-500 uppercase">Interactive Calendar</h3>
            <span className="text-[10px] font-bold text-zinc-500">Select high-lighted day to view log</span>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-xl relative">

            {/* Month Selector */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => {
                  const prev = new Date(historyMonth.getFullYear(), historyMonth.getMonth() - 1)
                  setHistoryMonth(prev)
                  fetchHistory(prev)
                  setSelectedDay(null)
                }}
                className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 flex items-center justify-center text-lg hover:text-white active:scale-95 transition"
              >
                ‹
              </button>
              <h2 className="text-white font-black text-base tracking-tight">
                {format(historyMonth, 'MMMM yyyy')}
              </h2>
              <button
                onClick={() => {
                  const next = new Date(historyMonth.getFullYear(), historyMonth.getMonth() + 1)
                  if (next > today) return
                  setHistoryMonth(next)
                  fetchHistory(next)
                  setSelectedDay(null)
                }}
                disabled={
                  historyMonth.getFullYear() === today.getFullYear() &&
                  historyMonth.getMonth() === today.getMonth()
                }
                className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 flex items-center justify-center text-lg hover:text-white active:scale-95 transition disabled:opacity-10 disabled:pointer-events-none"
              >
                ›
              </button>
            </div>

            {/* Weekday Grid Labels */}
            <div className="grid grid-cols-7 gap-1.5 mb-3">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => (
                <div
                  key={index}
                  className="text-center text-[10px] text-zinc-600 font-black uppercase tracking-wider py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid Area */}
            {historyLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Querying Database...</p>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1.5">

                {/* Offset Days */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Logged Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const log = getLogForDay(day)
                  const cellDate = new Date(historyMonth.getFullYear(), historyMonth.getMonth(), day)
                  const isFuture = cellDate > today
                  const isToday =
                    day === today.getDate() &&
                    historyMonth.getMonth() === today.getMonth() &&
                    historyMonth.getFullYear() === today.getFullYear()
                  const isSelected = selectedDay &&
                    new Date(selectedDay.date).getDate() === day &&
                    new Date(selectedDay.date).getMonth() === historyMonth.getMonth()

                  return (
                    <button
                      key={day}
                      onClick={() => {
                        if (!log || isFuture) return
                        setSelectedDay(log)
                      }}
                      disabled={!log || isFuture}
                      className={`
                        aspect-square rounded-xl text-xs font-bold flex flex-col items-center justify-center relative transition-all duration-150
                        ${isFuture ? 'text-zinc-800 cursor-default pointer-events-none' : ''}
                        ${!log && !isFuture ? 'text-zinc-700 bg-zinc-900/10 border border-zinc-900/30 cursor-default pointer-events-none' : ''}
                        ${log?.completed ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10 hover:bg-rose-600' : ''}
                        ${log && !log.completed ? 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700' : ''}
                        ${isToday ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950' : ''}
                        ${isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-zinc-950 scale-95' : ''}
                      `}
                    >
                      <span>{day}</span>
                      {log?.completed && (
                        <span className="w-1 h-1 rounded-full bg-white/60 absolute bottom-1" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Color Guide / Legend */}
            <div className="flex items-center justify-between border-t border-zinc-900 mt-5 pt-4 text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-rose-500" /> Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-zinc-900 border border-zinc-800" /> Partial log
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-zinc-950 border border-zinc-900" /> Empty
              </span>
            </div>

          </div>
        </div>

        {/* SECTION 3: INSIGHTS & MONTH TRENDS */}
        <div className="space-y-3">
          <h3 className="text-[11px] font-black tracking-widest text-zinc-500 uppercase px-1">Monthly Highlights</h3>
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">

            {/* Steps Goal Highlight */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <span className="text-lg">🏆</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Single-Day High Score</p>
                <p className="text-sm font-bold text-zinc-100 mt-0.5">
                  {maxStepsDay > 0 ? `${maxStepsDay.toLocaleString()} steps` : 'No steps tracked yet'}
                </p>
              </div>
            </div>



          </div>
        </div>

      </div>

      {/* Day detail modal (Dynamic Centered Card) */}
      {selectedDay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedDay(null)}
        >
          <div
            className="bg-zinc-950 border border-zinc-850 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-900 bg-zinc-950 shrink-0">
              <div>
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Log Summary</span>
                <h3 className="text-white font-black text-lg leading-tight mt-0.5">
                  {format(new Date(selectedDay.date), 'EEEE, MMMM d')}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-zinc-400 bg-zinc-900 hover:bg-zinc-850 text-xl w-9 h-9 flex items-center justify-center rounded-full transition active:scale-90"
              >
                ✕
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="px-6 py-5 space-y-6 overflow-y-auto">

              {/* Stats Overview Block */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-3 text-center">
                  <p className="text-xs text-zinc-500 font-medium mb-1">😴 Sleep</p>
                  <p className="text-sm font-bold text-indigo-400 truncate">
                    {selectedDay.sleep_hours ? `${selectedDay.sleep_hours}h` : '—'}
                  </p>
                  {selectedDay.sleep_time && (
                    <p className="text-[10px] text-zinc-600 mt-0.5 truncate">{selectedDay.sleep_time}</p>
                  )}
                </div>
                <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-3 text-center">
                  <p className="text-xs text-zinc-500 font-medium mb-1">💧 Water</p>
                  <p className="text-sm font-bold text-sky-400 truncate">
                    {selectedDay.water_glasses ?? 0} Gl.
                  </p>
                  <p className="text-[10px] text-zinc-600 mt-0.5 truncate">Glasses</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-3 text-center">
                  <p className="text-xs text-zinc-500 font-medium mb-1">👟 Steps</p>
                  <p className="text-sm font-bold text-emerald-400 truncate">
                    {selectedDay.steps ?? '—'}
                  </p>
                  <p className="text-[10px] text-zinc-600 mt-0.5 truncate">Total</p>
                </div>
              </div>

              {/* Meals Section */}
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-3 flex items-center gap-1.5">
                  <span>🍽️</span> Meals & Nutrition
                </p>
                <div className="space-y-2.5">
                  {[
                    { label: 'Breakfast', food: selectedDay.breakfast_food, time: selectedDay.breakfast_time, skipped: selectedDay.breakfast_skipped },
                    { label: 'Lunch', food: selectedDay.lunch_food, time: selectedDay.lunch_time, skipped: selectedDay.lunch_skipped },
                    { label: 'Dinner', food: selectedDay.dinner_food, time: selectedDay.dinner_time, skipped: selectedDay.dinner_skipped },
                  ].map(meal => (
                    <div key={meal.label} className="bg-zinc-900/40 border border-zinc-850/60 rounded-xl px-4 py-3 flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-zinc-400 text-xs font-bold">{meal.label}</p>
                          {meal.time && <span className="text-[10px] text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded">{meal.time}</span>}
                        </div>
                        <p className="text-zinc-200 text-sm font-medium">
                          {meal.skipped
                            ? <span className="text-zinc-500 italic">Skipped</span>
                            : meal.food || <span className="text-zinc-700">—</span>
                          }
                        </p>
                      </div>
                    </div>
                  ))}

                  {(selectedDay.extra_meals ?? []).filter((m: any) => !m.skipped).map((meal: any, i: number) => (
                    <div key={i} className="bg-zinc-900/40 border border-zinc-850/60 rounded-xl px-4 py-3 flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-zinc-400 text-xs font-bold">{meal.label || `Extra Meal ${i + 1}`}</p>
                          {meal.time && <span className="text-[10px] text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded">{meal.time}</span>}
                        </div>
                        <p className="text-zinc-200 text-sm font-medium">{meal.food || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>



              {/* Exercise */}
              {(() => {
                const d = new Date(selectedDay.date)
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                const exs = getDayExercises(dateStr)
                if (exs.length === 0) return null
                return (
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-3 flex items-center gap-1.5">
                      <span>🏃</span> Exercises Logged
                    </p>
                    <div className="space-y-2">
                      {exs.map((ex: any) => (
                        <div key={ex.id} className="bg-zinc-900/40 border border-zinc-850/60 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-zinc-200 text-sm font-bold truncate">{ex.exercise_name}</p>
                            {ex.exercise_desc && (
                              <p className="text-zinc-500 text-xs truncate mt-0.5">{ex.exercise_desc}</p>
                            )}
                          </div>
                          <span className={`shrink-0 text-xs font-black px-2.5 py-1 rounded-full ${ex.completed
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                            }`}>
                            {ex.completed ? '✓ Done' : '✕ Missed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Food check */}
              {(() => {
                const d = new Date(selectedDay.date)
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                const foods = getDayFoods(dateStr)
                if (foods.length === 0) return null
                return (
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-3 flex items-center gap-1.5">
                      <span>📋</span> Food Directives Check
                    </p>
                    <div className="space-y-2">
                      {foods.map((f: any) => (
                        <div key={f.id} className="bg-zinc-900/40 border border-zinc-850/60 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-zinc-200 text-sm font-bold truncate">{f.food_name}</p>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                              {f.food_type === 'skip' ? '🚫 Skip Target' : '✅ Must Eat Target'}
                            </p>
                          </div>
                          <span className={`shrink-0 text-xs font-black px-2.5 py-1 rounded-full ${f.complied
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                            }`}>
                            {f.complied ? 'Complied' : 'Failed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

            </div>
          </div>
        </div>
      )}
    </div>
  )
}