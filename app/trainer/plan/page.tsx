'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Food { name: string; reason: string }

export default function TrainerPlan() {
  const [quote, setQuote] = useState('')
  const [exerciseDesc, setExerciseDesc] = useState('')
  const [exerciseMins, setExerciseMins] = useState('')
  const [sleepHours, setSleepHours] = useState('')
  const [skipFoods, setSkipFoods] = useState<Food[]>([{ name: '', reason: '' }])
  const [mustEatFoods, setMustEatFoods] = useState<Food[]>([{ name: '', reason: '' }])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const pin = sessionStorage.getItem('trainer_pin')
    if (!pin) { router.push('/trainer'); return }

    fetch('/api/trainer/plan', { headers: { 'x-trainer-pin': pin } })
      .then(r => r.json())
      .then(data => {
        if (data.plan) {
          setQuote(data.plan.daily_quote ?? '')
          setExerciseDesc(data.plan.exercise_desc ?? '')
          setExerciseMins(data.plan.exercise_mins ?? '')
          setSleepHours(data.plan.sleep_hours ?? '')
        }
        if (data.skipFoods?.length) setSkipFoods(data.skipFoods)
        if (data.mustEatFoods?.length) setMustEatFoods(data.mustEatFoods)
        setLoading(false)
      })
  }, [router])

  function updateSkip(i: number, field: keyof Food, val: string) {
    setSkipFoods(prev => prev.map((f, idx) => idx === i ? { ...f, [field]: val } : f))
  }

  function updateMust(i: number, field: keyof Food, val: string) {
    setMustEatFoods(prev => prev.map((f, idx) => idx === i ? { ...f, [field]: val } : f))
  }

  async function handleSave() {
    const pin = sessionStorage.getItem('trainer_pin')
    if (!pin) return
    setSaving(true)

    await fetch('/api/trainer/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-trainer-pin': pin,
      },
      body: JSON.stringify({
        daily_quote: quote,
        exercise_desc: exerciseDesc,
        exercise_mins: parseInt(exerciseMins) || null,
        sleep_hours: parseFloat(sleepHours) || null,
        skipFoods: skipFoods.filter(f => f.name.trim()),
        mustEatFoods: mustEatFoods.filter(f => f.name.trim()),
      }),
    })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-gray-400">Loading plan...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-24">
      <div className="bg-gray-800 px-6 py-4 sticky top-0 z-10 border-b border-gray-700">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-white font-bold text-lg">✏️ Edit Plan</h1>
          <button onClick={() => router.push('/trainer/dashboard')}
            className="text-gray-400 text-sm">Back</button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Daily quote */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <h2 className="text-white font-semibold mb-3">💬 Daily Motivational Quote</h2>
          <textarea
            value={quote}
            onChange={e => setQuote(e.target.value)}
            placeholder="Write something inspiring for her today..."
            rows={3}
            className="w-full px-3 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Exercise target */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <h2 className="text-white font-semibold mb-3">🏃 Exercise Target</h2>
          <input
            value={exerciseDesc}
            onChange={e => setExerciseDesc(e.target.value)}
            placeholder="e.g. Walk or light cardio"
            className="w-full px-3 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <input
            type="number"
            value={exerciseMins}
            onChange={e => setExerciseMins(e.target.value)}
            placeholder="Duration in minutes"
            className="w-full px-3 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Sleep target */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <h2 className="text-white font-semibold mb-3">😴 Sleep Target</h2>
          <input
            type="number"
            step="0.5"
            value={sleepHours}
            onChange={e => setSleepHours(e.target.value)}
            placeholder="Recommended hours (e.g. 8)"
            className="w-full px-3 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Skip foods */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <h2 className="text-white font-semibold mb-3">🚫 Foods to Skip</h2>
          <div className="space-y-3">
            {skipFoods.map((food, i) => (
              <div key={i} className="space-y-2">
                <input
                  value={food.name}
                  onChange={e => updateSkip(i, 'name', e.target.value)}
                  placeholder="Food name"
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <input
                  value={food.reason}
                  onChange={e => updateSkip(i, 'reason', e.target.value)}
                  placeholder="Why to skip it"
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                {skipFoods.length > 1 && (
                  <button
                    onClick={() => setSkipFoods(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-red-400 text-xs"
                  >
                    Remove
                  </button>
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

        {/* Must-eat foods */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <h2 className="text-white font-semibold mb-3">✅ Foods to Add</h2>
          <div className="space-y-3">
            {mustEatFoods.map((food, i) => (
              <div key={i} className="space-y-2">
                <input
                  value={food.name}
                  onChange={e => updateMust(i, 'name', e.target.value)}
                  placeholder="Food name"
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <input
                  value={food.reason}
                  onChange={e => updateMust(i, 'reason', e.target.value)}
                  placeholder="Why it helps"
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                {mustEatFoods.length > 1 && (
                  <button
                    onClick={() => setMustEatFoods(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-red-400 text-xs"
                  >
                    Remove
                  </button>
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

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-2xl bg-rose-500 text-white text-lg font-bold disabled:opacity-60 active:scale-95 transition"
        >
          {saving ? 'Saving...' : saved ? '✅ Plan Saved!' : 'Save Plan'}
        </button>

      </div>
    </div>
  )
}