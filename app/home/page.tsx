'use client'

import FoodCheckCard from '@/components/FoodCheckCard'
import SleepTimePicker from '@/components/SleepTimePicker'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getDayNumber } from '@/lib/utils'
import WaterTracker from '@/components/WaterTracker'
import MealCard from '@/components/MealCard'

interface ExtraMeal {
  id: string; label: string; food: string; time: string; skipped: boolean
}

interface DailyLog {
  breakfast_food: string; breakfast_time: string; breakfast_skipped: boolean
  lunch_food: string; lunch_time: string; lunch_skipped: boolean
  dinner_food: string; dinner_time: string; dinner_skipped: boolean
  snack_food: string; snack_time: string
  extra_meals: ExtraMeal[]
  water_glasses: number; steps: string
  exercise_desc: string; exercise_mins: string
  sleep_time: string; wake_time: string; sleep_hours: string
 
  completed: boolean
}

const emptyLog: DailyLog = {
  breakfast_food: '', breakfast_time: '', breakfast_skipped: false,
  lunch_food: '', lunch_time: '', lunch_skipped: false,
  dinner_food: '', dinner_time: '', dinner_skipped: false,
  snack_food: '', snack_time: '',
  extra_meals: [],
  water_glasses: 0, steps: '',
  exercise_desc: '', exercise_mins: '',
  sleep_time: '', wake_time: '', sleep_hours: '',
  
 completed: false,
}

const inputCls = "w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"

function validate(
  log: DailyLog,
  steps: string,
  skipFoods: any[],
  mustEatFoods: any[],
  foodLog: any[],
  exercises: any[],
  exerciseLog: any[]
): string[] {
  const errors: string[] = []

  if (!log.breakfast_skipped && !log.breakfast_food.trim()) errors.push('Breakfast food')
  if (!log.lunch_skipped && !log.lunch_food.trim()) errors.push('Lunch food')
  if (!log.dinner_skipped && !log.dinner_food.trim()) errors.push('Dinner food')
  if (log.water_glasses === 0) errors.push('Water intake')
  if (!steps || steps === '' || parseInt(steps) === 0) errors.push('Steps count')
  if (!log.sleep_time) errors.push('Sleep time')
  if (!log.wake_time) errors.push('Wake time')

  // All food checks must be answered
  for (const food of skipFoods) {
    const entry = foodLog.find(f => f.food_name === food.name && f.food_type === 'skip')
    if (!entry || entry.complied === null || entry.complied === undefined) {
      errors.push(`Food check: did you skip ${food.name}?`)
    }
  }
  for (const food of mustEatFoods) {
    const entry = foodLog.find(f => f.food_name === food.name && f.food_type === 'must')
    if (!entry || entry.complied === null || entry.complied === undefined) {
      errors.push(`Food check: did you eat ${food.name}?`)
    }
  }

  // All exercises must be marked
  for (const ex of exercises) {
    const entry = exerciseLog.find(e => e.exercise_id === ex.id)
    if (!entry) {
      errors.push(`Exercise: mark "${ex.name}" as done or not`)
    }
  }

  return errors
}

function calculateSleepHours(sleepTime: string, wakeTime: string): string {
  if (!sleepTime || !wakeTime) return ''
  const [sh, sm] = sleepTime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)
  let sleepMinutes = sh * 60 + sm
  let wakeMinutes = wh * 60 + wm
  if (wakeMinutes <= sleepMinutes) wakeMinutes += 24 * 60
  return ((wakeMinutes - sleepMinutes) / 60).toFixed(1)
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [log, setLog] = useState<DailyLog>(emptyLog)
  const [plan, setPlan] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dayNumber, setDayNumber] = useState(1)
  const [errors, setErrors] = useState<string[]>([])
  const [showErrors, setShowErrors] = useState(false)
  const [skipFoods, setSkipFoods] = useState<any[]>([])
  const [mustEatFoods, setMustEatFoods] = useState<any[]>([])
  const [foodLog, setFoodLog] = useState<any[]>([])
  const [exercises, setExercises] = useState<any[]>([])
  const [exerciseLog, setExerciseLog] = useState<any[]>([])
  const [steps, setSteps] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/daily-log')
      .then(r => {
        if (r.status === 401) { router.push('/login'); return null }
        return r.json()
      })
      .then(data => {
        if (!data) return
        setUser(data.user)
        setPlan(data.plan)
        setSkipFoods(data.skipFoods ?? [])
        setMustEatFoods(data.mustEatFoods ?? [])

        if (data.log) {
          const normalizedExtraMeals = (data.log.extra_meals ?? []).map((m: any) => ({
            ...m,
            food: m.food ?? '',
            time: m.time ?? '',
          }))
          setLog({
            ...emptyLog, ...data.log,
            breakfast_food: data.log.breakfast_food ?? '',
            breakfast_time: data.log.breakfast_time ?? '',
            lunch_food: data.log.lunch_food ?? '',
            lunch_time: data.log.lunch_time ?? '',
            dinner_food: data.log.dinner_food ?? '',
            dinner_time: data.log.dinner_time ?? '',
            snack_food: data.log.snack_food ?? '',
            snack_time: data.log.snack_time ?? '',
            sleep_time: data.log.sleep_time ?? '',
            wake_time: data.log.wake_time ?? '',
            exercise_desc: data.log.exercise_desc ?? '',
            water_glasses: data.log.water_glasses ?? 0,
            steps: data.log.steps ?? '',
            exercise_mins: data.log.exercise_mins ?? '',
            sleep_hours: data.log.sleep_hours ?? '',
            extra_meals: normalizedExtraMeals,
            breakfast_skipped: data.log.breakfast_skipped ?? false,
            lunch_skipped: data.log.lunch_skipped ?? false,
            dinner_skipped: data.log.dinner_skipped ?? false,
           
          })
          setSteps(data.log.steps ? String(data.log.steps) : '')
        }

        const dn = getDayNumber(data.user.created_at)
        setDayNumber(dn)
      })

    fetch('/api/food-log').then(r => r.json()).then(d => setFoodLog(d.foodLog ?? []))
    fetch('/api/exercise-plan').then(r => r.json()).then(d => setExercises(d.exercises ?? []))
    fetch('/api/exercise-log').then(r => r.json()).then(d => setExerciseLog(d.exerciseLog ?? []))
  }, [router])

  const updateLog = (field: keyof DailyLog, value: any) =>
    setLog(prev => ({ ...prev, [field]: value }))

  const handleWaterChange = useCallback(async (glasses: number) => {
    setLog(prev => ({ ...prev, water_glasses: glasses }))
    await fetch('/api/water', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ glasses }),
    })
  }, [])

  function addExtraMeal() {
    const id = Date.now().toString()
    setLog(prev => ({
      ...prev,
      extra_meals: [...prev.extra_meals, {
        id, label: `Extra Meal ${prev.extra_meals.length + 1}`,
        food: '', time: '', skipped: false
      }]
    }))
  }

  function updateExtraMeal(id: string, field: keyof ExtraMeal, value: any) {
    setLog(prev => ({
      ...prev,
      extra_meals: prev.extra_meals.map(m => m.id === id ? { ...m, [field]: value } : m)
    }))
  }

  function removeExtraMeal(id: string) {
    setLog(prev => ({
      ...prev,
      extra_meals: prev.extra_meals.filter(m => m.id !== id)
    }))
  }

  function getFoodCompliance(name: string, type: string) {
    const entry = foodLog.find(f => f.food_name === name && f.food_type === type)
    return entry?.complied ?? null
  }

  async function toggleFoodCompliance(name: string, type: string, complied: boolean) {
    setFoodLog(prev => {
      const existing = prev.findIndex(f => f.food_name === name && f.food_type === type)
      if (existing >= 0) return prev.map((f, i) => i === existing ? { ...f, complied } : f)
      return [...prev, { food_name: name, food_type: type, complied }]
    })
    await fetch('/api/food-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ food_name: name, food_type: type, complied }),
    })
  }

  function getExerciseCompleted(id: number): boolean {
    return exerciseLog.find(e => e.exercise_id === id)?.completed ?? false
  }

  async function toggleExercise(exerciseId: number, completed: boolean) {
    setExerciseLog(prev => {
      const existing = prev.findIndex(e => e.exercise_id === exerciseId)
      if (existing >= 0) return prev.map((e, i) => i === existing ? { ...e, completed } : e)
      return [...prev, { exercise_id: exerciseId, completed }]
    })
    await fetch('/api/exercise-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exercise_id: exerciseId, completed }),
    })
  }

  async function handleSave() {
    const errs = validate(log, steps, skipFoods, mustEatFoods, foodLog, exercises, exerciseLog)
    if (errs.length > 0) {
      setErrors(errs)
      setShowErrors(true)
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/daily-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...log,
          steps: steps && steps !== '' ? parseInt(steps) : null,
          completed: true,
        }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        setSaving(false)
        setErrors([`Save failed: ${errBody.error ?? 'Unknown error'}`])
        setShowErrors(true)
        return
      }

      setSaving(false)
      setSaved(true)
      setShowErrors(false)
      setTimeout(() => { setSaved(false); router.push('/dashboard') }, 1500)
    } catch (err) {
      setSaving(false)
      setErrors(['Network error — please try again'])
      setShowErrors(true)
    }
  }
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] pb-24">
        {/* Header Skeleton */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 sticky top-0 z-10">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 w-12 bg-zinc-800 rounded animate-pulse" />
              <div className="h-5 w-28 bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="h-4 w-10 bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
          {/* Motivation Quote Skeleton */}
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-2xl p-4 flex flex-col items-center gap-2">
            <div className="h-2.5 w-24 bg-zinc-800 rounded animate-pulse" />
            <div className="h-3.5 w-3/4 bg-zinc-800 rounded animate-pulse" />
          </div>

          {/* Meals Section Skeleton */}
          <div className="space-y-3">
            <div className="h-3 w-14 bg-zinc-800 rounded ml-1 uppercase tracking-wide animate-pulse" />

            {/* 3 Core Meals Matching MealCard Dimensions */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-4 w-12 bg-zinc-800 rounded animate-pulse" />
                </div>
                <div className="h-10 bg-zinc-800/50 rounded-xl animate-pulse" />
              </div>
            ))}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <div className="flex-1 bg-zinc-900/30 rounded-2xl h-12 border border-dashed border-zinc-800 animate-pulse" />
              <div className="flex-1 bg-zinc-900/30 rounded-2xl h-12 border border-dashed border-zinc-800 animate-pulse" />
            </div>
          </div>

          {/* Water Tracker Skeleton */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-3">
            <div className="h-4 w-28 bg-zinc-800 rounded animate-pulse" />
            <div className="h-10 bg-zinc-800/50 rounded-xl animate-pulse" />
          </div>

          {/* Steps Skeleton */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-3">
            <div className="h-4 w-16 bg-zinc-800 rounded animate-pulse" />
            <div className="h-10 bg-zinc-800/50 rounded-xl animate-pulse" />
          </div>

          {/* Sleep Picker Skeleton */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 w-20 bg-zinc-800 rounded animate-pulse" />
              <div className="h-3.5 w-24 bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-14 bg-zinc-850 rounded-xl animate-pulse" />
              <div className="h-14 bg-zinc-850 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Food Check Card Skeleton */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-3">
            <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-12 bg-zinc-850 rounded-xl animate-pulse" />
              <div className="h-12 bg-zinc-850 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Save Button Skeleton */}
          <div className="h-14 bg-zinc-900 rounded-2xl border border-zinc-800 animate-pulse" />
        </div>
      </div>
    )
  }

  // Fallbacks with 'any' to prevent TypeScript compiler from complaining about 'never' type properties
  const progress: any = null
  const todayLog: any = null

  const latestWeight = progress?.weights?.slice(-1)[0]?.weight_kg
  const todayDone = todayLog?.completed

  const weightInterval = plan?.weight_interval_days ?? 3
  const daysUntilWeight = weightInterval - (dayNumber % weightInterval)
  const isWeightDayToday = dayNumber % weightInterval === 0

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-24">

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500">Day {dayNumber}</p>
            <h1 className="text-lg font-bold text-white">Today's Log</h1>
          </div>
          <button onClick={() => router.push('/dashboard')} className="text-rose-400 text-sm font-medium">
            Back
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Quote */}
        {plan?.daily_quote && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-center">
            <p className="text-rose-300 font-medium italic">"{plan.daily_quote}"</p>
          </div>
        )}

        {/* Meals */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 px-1">Meals</p>
          <div className="space-y-3">
            <MealCard label="Breakfast" emoji="🍳"
              food={log.breakfast_food} time={log.breakfast_time}
              skipped={log.breakfast_skipped}
              onFoodChange={v => updateLog('breakfast_food', v)}
              onTimeChange={v => updateLog('breakfast_time', v)}
              onSkipChange={v => updateLog('breakfast_skipped', v)} />
            <MealCard label="Lunch" emoji="🥗"
              food={log.lunch_food} time={log.lunch_time}
              skipped={log.lunch_skipped}
              onFoodChange={v => updateLog('lunch_food', v)}
              onTimeChange={v => updateLog('lunch_time', v)}
              onSkipChange={v => updateLog('lunch_skipped', v)} />
            <MealCard label="Dinner" emoji="🍽️"
              food={log.dinner_food} time={log.dinner_time}
              skipped={log.dinner_skipped}
              onFoodChange={v => updateLog('dinner_food', v)}
              onTimeChange={v => updateLog('dinner_time', v)}
              onSkipChange={v => updateLog('dinner_skipped', v)} />

            {log.extra_meals.map(meal => (
              <MealCard
                key={meal.id}
                label={meal.label}
                emoji="🍴"
                food={meal.food}
                time={meal.time}
                skipped={meal.skipped}
                isExtra
                onFoodChange={v => updateExtraMeal(meal.id, 'food', v)}
                onTimeChange={v => updateExtraMeal(meal.id, 'time', v)}
                onSkipChange={v => updateExtraMeal(meal.id, 'skipped', v)}
                onRemove={() => removeExtraMeal(meal.id)}
              />
            ))}

            <div className="flex gap-2">

              <button onClick={() => setLog(prev => ({
                ...prev,
                extra_meals: [...prev.extra_meals, {
                  id: Date.now().toString(),
                  label: 'Snack', food: '', time: '', skipped: false
                }]
              }))}
                className="flex-1 py-3 rounded-2xl border border-dashed border-zinc-700 text-zinc-500 text-sm font-medium hover:border-rose-500/50 hover:text-rose-400 transition active:scale-95">
                + Add Snack
              </button>
            </div>
          </div>
        </div>



        {/* Water */}
        <WaterTracker glasses={log.water_glasses} onChange={handleWaterChange} />

        {/* Sleep */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">😴 Sleep</h3>
            {plan?.sleep_hours && (
              <span className="text-xs text-rose-400">Target: {plan.sleep_hours}h</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <SleepTimePicker
              label="Slept at"
              value={log.sleep_time}
              onChange={v => {
                const hours = calculateSleepHours(v, log.wake_time)
                setLog(prev => ({ ...prev, sleep_time: v, sleep_hours: hours }))
              }}
            />
            <SleepTimePicker
              label="Woke at"
              value={log.wake_time}
              onChange={v => {
                const hours = calculateSleepHours(log.sleep_time, v)
                setLog(prev => ({ ...prev, wake_time: v, sleep_hours: hours }))
              }}
            />
          </div>
          {log.sleep_hours && (
            <div className="bg-zinc-800 rounded-xl px-3 py-2.5 text-center">
              <p className="text-zinc-400 text-xs">Total sleep</p>
              <p className="text-white text-lg font-bold">{log.sleep_hours} hours</p>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <h3 className="font-semibold text-white mb-3">👟 Steps</h3>
          <input
            type="number"
            value={steps}
            onChange={e => setSteps(e.target.value)}
            placeholder="How many steps today?"
            className={inputCls}
          />
        </div>

        {/* Exercise checklist */}
        {exercises.length > 0 && (
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-zinc-800">
              <h3 className="font-semibold text-white text-sm">🏃 Exercise Plan</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Mark what you completed today</p>
            </div>
            <div className="divide-y divide-zinc-800">
              {exercises.map((ex: any) => {
                const done = getExerciseCompleted(ex.id)
                const logged = exerciseLog.find(e => e.exercise_id === ex.id) !== undefined
                return (
                  <div key={ex.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-200 text-sm font-medium truncate">{ex.name}</p>
                      {ex.description && (
                        <p className="text-zinc-500 text-xs truncate">{ex.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleExercise(ex.id, true)}
                        className={`w-8 h-8 rounded-lg text-sm font-bold transition active:scale-90 flex items-center justify-center ${done ? 'bg-green-500 text-white' : 'bg-zinc-800 text-zinc-500'
                          }`}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => toggleExercise(ex.id, false)}
                        className={`w-8 h-8 rounded-lg text-sm font-bold transition active:scale-90 flex items-center justify-center ${logged && !done ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500'
                          }`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}





        {/* Food check */}
        <FoodCheckCard
          skipFoods={skipFoods}
          mustEatFoods={mustEatFoods}
          getCompliance={getFoodCompliance}
          onToggle={toggleFoodCompliance}
        />

        {/* Validation errors */}
        {showErrors && errors.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <p className="text-red-400 font-medium text-sm mb-2">Please fill in the following:</p>
            <ul className="space-y-1">
              {errors.map(e => (
                <li key={e} className="text-red-300 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-2xl bg-rose-500 text-white text-lg font-bold disabled:opacity-50 active:scale-95 transition"
        >
          {saving ? 'Saving...' : saved ? '✅ Saved!' : 'Save My Day'}
        </button>

      </div>
    </div>
  )
}