'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'

interface Log {
  date: string
  breakfast_food: string; breakfast_time: string
  lunch_food: string; lunch_time: string
  dinner_food: string; dinner_time: string
  snack_food: string; snack_time: string
  water_glasses: number; steps: number
  exercise_desc: string; exercise_mins: number
  sleep_time: string; wake_time: string; sleep_hours: number
 completed: boolean
}

export default function TrainerDashboard() {
  const [logs, setLogs] = useState<Log[]>([])
  const [user, setUser] = useState<any>(null)
  const [weights, setWeights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/trainer/logs')
      .then(r => r.json())
      .then(data => {
        setUser(data.user)
        setLogs(data.logs)
        setWeights(data.weights)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-24">
      <div className="bg-gray-800 px-6 py-4 sticky top-0 z-10 border-b border-gray-700">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs">Trainer Dashboard</p>
            <h1 className="text-white font-bold text-lg">{user?.name ?? 'Client'}'s Logs</h1>
          </div>
          <button
            onClick={() => router.push('/trainer/plan')}
            className="px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium"
          >
            Edit Plan
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">

        {/* Latest weight */}
        {weights.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <p className="text-gray-400 text-xs mb-1">Latest Weight</p>
            <p className="text-white text-2xl font-bold">
              {weights[0].weight_kg} kg
              <span className="text-gray-400 text-sm ml-2 font-normal">
                on {format(parseISO(weights[0].date), 'MMM d')}
              </span>
            </p>
            {weights.length > 1 && (
              <p className={`text-sm mt-1 ${
                weights[0].weight_kg < weights[1].weight_kg
                  ? 'text-green-400' : 'text-red-400'
              }`}>
                {weights[0].weight_kg < weights[1].weight_kg ? '↓' : '↑'}
                {' '}{Math.abs(weights[0].weight_kg - weights[1].weight_kg).toFixed(1)} kg from last entry
              </p>
            )}
          </div>
        )}

        {/* Daily logs */}
        {logs.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-3">📋</p>
            <p>No logs yet</p>
          </div>
        ) : (
          logs.map(log => {
            const dateKey = log.date
            const isOpen = expanded === dateKey

            return (
              <div key={dateKey} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                {/* Log header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : dateKey)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${log.completed ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    <span className="text-white font-medium">
                      {format(parseISO(log.date), 'EEEE, MMM d')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span>💧 {log.water_glasses ?? 0}</span>
                    <span>👟 {log.steps ?? '—'}</span>
                    <span>{isOpen ? '▲' : '▼'}</span>
                  </div>
                </button>

                {/* Expanded details */}
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-700 pt-3 space-y-3">

                    {/* Meals */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {[
                        { label: '🍳 Breakfast', food: log.breakfast_food, time: log.breakfast_time },
                        { label: '🥗 Lunch', food: log.lunch_food, time: log.lunch_time },
                        { label: '🍽️ Dinner', food: log.dinner_food, time: log.dinner_time },
                        { label: '🍎 Snack', food: log.snack_food, time: log.snack_time },
                      ].map(({ label, food, time }) => (
                        <div key={label} className="bg-gray-700 rounded-xl p-3">
                          <p className="text-gray-400 text-xs mb-1">{label}</p>
                          <p className="text-white text-sm">{food || '—'}</p>
                          {time && <p className="text-gray-500 text-xs mt-1">{time}</p>}
                        </div>
                      ))}
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="bg-gray-700 rounded-xl p-3 text-center">
                        <p className="text-gray-400 text-xs">Water</p>
                        <p className="text-white font-bold">{log.water_glasses ?? 0} 💧</p>
                      </div>
                      <div className="bg-gray-700 rounded-xl p-3 text-center">
                        <p className="text-gray-400 text-xs">Steps</p>
                        <p className="text-white font-bold">{log.steps ?? '—'}</p>
                      </div>
                      <div className="bg-gray-700 rounded-xl p-3 text-center">
                        <p className="text-gray-400 text-xs">Sleep</p>
                        <p className="text-white font-bold">{log.sleep_hours ?? '—'}h</p>
                      </div>
                    </div>

                    {/* Exercise */}
                    {log.exercise_desc && (
                      <div className="bg-gray-700 rounded-xl p-3 text-sm">
                        <p className="text-gray-400 text-xs mb-1">🏃 Exercise</p>
                        <p className="text-white">{log.exercise_desc} · {log.exercise_mins} min</p>
                      </div>
                    )}

         
         

                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}