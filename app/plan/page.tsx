'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Food { name: string; reason: string }

export default function PlanPage() {
  const [exerciseDesc, setExerciseDesc] = useState('')
  const [exerciseMins, setExerciseMins] = useState('')
  const [sleepHours, setSleepHours] = useState('')
  const [quote, setQuote] = useState('')
  const [weightInterval, setWeightInterval] = useState('3')
  const [measurementInterval, setMeasurementInterval] = useState('7')
  const [skipFoods, setSkipFoods] = useState<Food[]>([])
  const [mustEatFoods, setMustEatFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/trainer/plan')
      .then(r => r.json())
      .then(data => {
        if (data.plan) {
          setExerciseDesc(data.plan.exercise_desc ?? '')
          setExerciseMins(String(data.plan.exercise_mins ?? ''))
          setSleepHours(String(data.plan.sleep_hours ?? ''))
          setQuote(data.plan.daily_quote ?? '')
          setWeightInterval(String(data.plan.weight_interval_days ?? 3))
          setMeasurementInterval(String(data.plan.measurement_interval_days ?? 7))
        }
        setSkipFoods(data.skipFoods?.length ? data.skipFoods : [{ name: '', reason: '' }])
        setMustEatFoods(data.mustEatFoods?.length ? data.mustEatFoods : [{ name: '', reason: '' }])
        setLoading(false)
      })
  }, [])

  async function handleSave() {
    setSaving(true)
    await fetch('/api/trainer/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exercise_desc: exerciseDesc,
        exercise_mins: parseInt(exerciseMins) || null,
        sleep_hours: parseFloat(sleepHours) || null,
        daily_quote: quote,
        weight_interval_days: parseInt(weightInterval) || 3,
        measurement_interval_days: parseInt(measurementInterval) || 7,
        skipFoods: skipFoods.filter(f => f.name.trim()),
        mustEatFoods: mustEatFoods.filter(f => f.name.trim()),
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <p className="text-zinc-500">Loading your plan...</p>
      </div>
    )
  }

  const inputCls = "w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-32">
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">📋 My Plan</h1>
          <button onClick={() => router.push('/dashboard')}
            className="text-rose-400 font-medium text-sm">← Home</button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        <p className="text-xs text-zinc-500 px-1">
          This is fully yours to customize — set your own targets, quote, and food rules.
        </p>

        {/* Daily quote */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <h2 className="font-semibold text-white mb-2">💬 Daily Motivation</h2>
          <textarea
            value={quote}
            onChange={e => setQuote(e.target.value)}
            placeholder="Write something that motivates you..."
            rows={2}
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* Exercise */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <h2 className="font-semibold text-white mb-2">🏃 Exercise Goal</h2>
          <input
            value={exerciseDesc}
            onChange={e => setExerciseDesc(e.target.value)}
            placeholder="e.g. Walk or light cardio"
            className={`${inputCls} mb-2`}
          />
          <input
            type="number"
            value={exerciseMins}
            onChange={e => setExerciseMins(e.target.value)}
            placeholder="Duration in minutes"
            className={inputCls}
          />
        </div>

        {/* Sleep */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <h2 className="font-semibold text-white mb-2">😴 Sleep Goal</h2>
          <input
            type="number"
            step="0.5"
            value={sleepHours}
            onChange={e => setSleepHours(e.target.value)}
            placeholder="Hours per night"
            className={inputCls}
          />
        </div>

        {/* Weight / measurement intervals */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <h2 className="font-semibold text-white mb-3">⚖️ Check-in Schedule</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Weigh-in every (days)</label>
              <input
                type="number"
                min={1}
                value={weightInterval}
                onChange={e => setWeightInterval(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Measurements every (days)</label>
              <input
                type="number"
                min={1}
                value={measurementInterval}
                onChange={e => setMeasurementInterval(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Skip foods */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-red-500/20">
          <h2 className="font-semibold text-white mb-3">🚫 Foods to Skip</h2>
          <div className="space-y-3">
            {skipFoods.map((food, i) => (
              <div key={i} className="space-y-1.5">
                <input
                  value={food.name}
                  onChange={e => setSkipFoods(prev => prev.map((f, idx) => idx === i ? { ...f, name: e.target.value } : f))}
                  placeholder="Food name"
                  className={inputCls}
                />
                <input
                  value={food.reason}
                  onChange={e => setSkipFoods(prev => prev.map((f, idx) => idx === i ? { ...f, reason: e.target.value } : f))}
                  placeholder="Why to skip it"
                  className={inputCls}
                />
                {skipFoods.length > 1 && (
                  <button onClick={() => setSkipFoods(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-red-400 text-xs">Remove</button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => setSkipFoods(prev => [...prev, { name: '', reason: '' }])}
            className="mt-3 text-rose-400 text-sm font-medium"
          >
            + Add food
          </button>
        </div>

        {/* Must eat foods */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-green-500/20">
          <h2 className="font-semibold text-white mb-3">✅ Must Eat</h2>
          <div className="space-y-3">
            {mustEatFoods.map((food, i) => (
              <div key={i} className="space-y-1.5">
                <input
                  value={food.name}
                  onChange={e => setMustEatFoods(prev => prev.map((f, idx) => idx === i ? { ...f, name: e.target.value } : f))}
                  placeholder="Food name"
                  className={inputCls}
                />
                <input
                  value={food.reason}
                  onChange={e => setMustEatFoods(prev => prev.map((f, idx) => idx === i ? { ...f, reason: e.target.value } : f))}
                  placeholder="Why it helps"
                  className={inputCls}
                />
                {mustEatFoods.length > 1 && (
                  <button onClick={() => setMustEatFoods(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-red-400 text-xs">Remove</button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => setMustEatFoods(prev => [...prev, { name: '', reason: '' }])}
            className="mt-3 text-rose-400 text-sm font-medium"
          >
            + Add food
          </button>
        </div>

   

      </div>

      {/* Sticky save button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-zinc-800 p-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-2xl bg-rose-500 text-white text-lg font-bold disabled:opacity-50 active:scale-95 transition"
          >
            {saving ? 'Saving...' : saved ? '✅ Saved!' : 'Save Plan'}
          </button>
        </div>
      </div>
    </div>
  )
}