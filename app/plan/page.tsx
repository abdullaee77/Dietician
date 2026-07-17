// 'use client'

// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'

// interface Food { name: string; reason: string }
// interface Exercise { name: string; description: string }

// export default function PlanPage() {
//   const [exerciseMins, setExerciseMins] = useState('')
//   const [sleepHours, setSleepHours] = useState('')
//   const [quote, setQuote] = useState('')
//   const [weightInterval, setWeightInterval] = useState('3')
//   const [skipFoods, setSkipFoods] = useState<Food[]>([{ name: '', reason: '' }])
//   const [mustEatFoods, setMustEatFoods] = useState<Food[]>([{ name: '', reason: '' }])
//   const [exercises, setExercises] = useState<Exercise[]>([{ name: '', description: '' }])
//   const [loading, setLoading] = useState(true)
//   const [saving, setSaving] = useState(false)
//   const [saved, setSaved] = useState(false)
//   const router = useRouter()

//   useEffect(() => {
//     Promise.all([
//       fetch('/api/trainer/plan').then(r => r.json()),
//       fetch('/api/exercise-plan').then(r => r.json()),
//     ]).then(([planData, exerciseData]) => {
//       if (planData.plan) {
//         setExerciseMins(String(planData.plan.exercise_mins ?? ''))
//         setSleepHours(String(planData.plan.sleep_hours ?? ''))
//         setQuote(planData.plan.daily_quote ?? '')
//         setWeightInterval(String(planData.plan.weight_interval_days ?? 3))
//       }
//       setSkipFoods(planData.skipFoods?.length ? planData.skipFoods : [{ name: '', reason: '' }])
//       setMustEatFoods(planData.mustEatFoods?.length ? planData.mustEatFoods : [{ name: '', reason: '' }])
//       setExercises(exerciseData.exercises?.length ? exerciseData.exercises : [{ name: '', description: '' }])
//       setLoading(false)
//     })
//   }, [])

//   async function handleSave() {
//     setSaving(true)
//     await Promise.all([
//       fetch('/api/trainer/plan', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           exercise_desc: '',
//           exercise_mins: parseInt(exerciseMins) || null,
//           sleep_hours: parseFloat(sleepHours) || null,
//           daily_quote: quote,
//           weight_interval_days: parseInt(weightInterval) || 3,
//           skipFoods: skipFoods.filter(f => f.name.trim()),
//           mustEatFoods: mustEatFoods.filter(f => f.name.trim()),
//         }),
//       }),
//       fetch('/api/exercise-plan', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ exercises: exercises.filter(e => e.name.trim()) }),
//       }),
//     ])
//     setSaving(false)
//     setSaved(true)
//     setTimeout(() => setSaved(false), 2000)
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
//         <div className="relative w-12 h-12">
//           <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
//           <div className="absolute inset-0 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
//         </div>
//       </div>
//     )
//   }

//   const inputCls = "w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"

//   return (
//     <div className="min-h-screen bg-[#0f0f0f] pb-32">
//       <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 sticky top-0 z-10">
//         <div className="max-w-lg mx-auto flex items-center justify-between">
//           <h1 className="text-xl font-bold text-white">📋 My Plan</h1>
//           <button onClick={() => router.push('/dashboard')}
//             className="text-rose-400 font-medium text-sm">Home</button>
//         </div>
//       </div>

//       <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

//         <p className="text-xs text-zinc-500 px-1">
//           Customize everything — your targets, quote, foods, and exercises.
//         </p>

//         {/* Daily quote */}
//         <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
//           <h2 className="font-semibold text-white mb-2">💬 Daily Motivation</h2>
//           <textarea
//             value={quote}
//             onChange={e => setQuote(e.target.value)}
//             placeholder="Write something that motivates you..."
//             rows={2}
//             className={`${inputCls} resize-none`}
//           />
//         </div>

//         {/* Sleep */}
//         <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
//           <h2 className="font-semibold text-white mb-2">😴 Sleep Goal</h2>
//           <input
//             type="number"
//             step="0.5"
//             value={sleepHours}
//             onChange={e => setSleepHours(e.target.value)}
//             placeholder="Hours per night"
//             className={inputCls}
//           />
//         </div>

//         {/* Weight interval */}
//         <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
//           <h2 className="font-semibold text-white mb-3">⚖️ Check-in Schedule</h2>
//           <div>
//             <label className="text-xs text-zinc-500 mb-1 block">Weigh-in every (days)</label>
//             <input
//               type="number"
//               min={1}
//               value={weightInterval}
//               onChange={e => setWeightInterval(e.target.value)}
//               className={inputCls}
//             />
//           </div>
//         </div>

//         {/* Exercise plan */}
//         <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
//           <h2 className="font-semibold text-white mb-3">🏃 Exercise Plan</h2>
//           <div className="space-y-3">
//             {exercises.map((ex, i) => (
//               <div key={i} className="space-y-1.5">
//                 <input
//                   value={ex.name}
//                   onChange={e => setExercises(prev => prev.map((x, idx) =>
//                     idx === i ? { ...x, name: e.target.value } : x))}
//                   placeholder="Exercise name (e.g. Morning Walk)"
//                   className={inputCls}
//                 />
//                 <input
//                   value={ex.description}
//                   onChange={e => setExercises(prev => prev.map((x, idx) =>
//                     idx === i ? { ...x, description: e.target.value } : x))}
//                   placeholder="Description / duration (e.g. 30 min brisk walk)"
//                   className={inputCls}
//                 />
//                 {exercises.length > 1 && (
//                   <button
//                     onClick={() => setExercises(prev => prev.filter((_, idx) => idx !== i))}
//                     className="text-red-400 text-xs"
//                   >
//                     Remove
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//           <button
//             onClick={() => setExercises(prev => [...prev, { name: '', description: '' }])}
//             className="mt-3 text-rose-400 text-sm font-medium"
//           >
//             + Add exercise
//           </button>
//         </div>

//         {/* Skip foods */}
//         <div className="bg-zinc-900 rounded-2xl p-4 border border-red-500/20">
//           <h2 className="font-semibold text-white mb-3">🚫 Foods to Skip</h2>
//           <div className="space-y-3">
//             {skipFoods.map((food, i) => (
//               <div key={i} className="space-y-1.5">
//                 <input
//                   value={food.name}
//                   onChange={e => setSkipFoods(prev => prev.map((f, idx) =>
//                     idx === i ? { ...f, name: e.target.value } : f))}
//                   placeholder="Food name"
//                   className={inputCls}
//                 />
//                 <input
//                   value={food.reason}
//                   onChange={e => setSkipFoods(prev => prev.map((f, idx) =>
//                     idx === i ? { ...f, reason: e.target.value } : f))}
//                   placeholder="Why to skip it"
//                   className={inputCls}
//                 />
//                 {skipFoods.length > 1 && (
//                   <button
//                     onClick={() => setSkipFoods(prev => prev.filter((_, idx) => idx !== i))}
//                     className="text-red-400 text-xs"
//                   >
//                     Remove
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//           <button
//             onClick={() => setSkipFoods(prev => [...prev, { name: '', reason: '' }])}
//             className="mt-3 text-rose-400 text-sm font-medium"
//           >
//             + Add food
//           </button>
//         </div>

//         {/* Must eat foods */}
//         <div className="bg-zinc-900 rounded-2xl p-4 border border-green-500/20">
//           <h2 className="font-semibold text-white mb-3">✅ Must Eat</h2>
//           <div className="space-y-3">
//             {mustEatFoods.map((food, i) => (
//               <div key={i} className="space-y-1.5">
//                 <input
//                   value={food.name}
//                   onChange={e => setMustEatFoods(prev => prev.map((f, idx) =>
//                     idx === i ? { ...f, name: e.target.value } : f))}
//                   placeholder="Food name"
//                   className={inputCls}
//                 />
//                 <input
//                   value={food.reason}
//                   onChange={e => setMustEatFoods(prev => prev.map((f, idx) =>
//                     idx === i ? { ...f, reason: e.target.value } : f))}
//                   placeholder="Why it helps"
//                   className={inputCls}
//                 />
//                 {mustEatFoods.length > 1 && (
//                   <button
//                     onClick={() => setMustEatFoods(prev => prev.filter((_, idx) => idx !== i))}
//                     className="text-red-400 text-xs"
//                   >
//                     Remove
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//           <button
//             onClick={() => setMustEatFoods(prev => [...prev, { name: '', reason: '' }])}
//             className="mt-3 text-rose-400 text-sm font-medium"
//           >
//             + Add food
//           </button>
//         </div>

//       </div>

//       {/* Sticky save */}
//       <div className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-zinc-800 p-4">
//         <div className="max-w-lg mx-auto">
//           <button
//             onClick={handleSave}
//             disabled={saving}
//             className="w-full py-4 rounded-2xl bg-rose-500 text-white text-lg font-bold disabled:opacity-50 active:scale-95 transition"
//           >
//             {saving ? 'Saving...' : saved ? '✅ Saved!' : 'Save Plan'}
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Food { name: string; reason: string }
interface Exercise { name: string; description: string }

export default function PlanPage() {
  const [exerciseMins, setExerciseMins] = useState('')
  const [sleepHours, setSleepHours] = useState('')
  const [quote, setQuote] = useState('')
  const [weightInterval, setWeightInterval] = useState('3')
  const [skipFoods, setSkipFoods] = useState<Food[]>([{ name: '', reason: '' }])
  const [mustEatFoods, setMustEatFoods] = useState<Food[]>([{ name: '', reason: '' }])
  const [exercises, setExercises] = useState<Exercise[]>([{ name: '', description: '' }])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  useEffect(() => {
    Promise.all([
      fetch('/api/trainer/plan').then(r => r.json()),
      fetch('/api/exercise-plan').then(r => r.json()),
    ]).then(([planData, exerciseData]) => {
      if (planData.plan) {
        setExerciseMins(String(planData.plan.exercise_mins ?? ''))
        setSleepHours(String(planData.plan.sleep_hours ?? ''))
        setQuote(planData.plan.daily_quote ?? '')
        setWeightInterval(String(planData.plan.weight_interval_days ?? 3))
      }
      setSkipFoods(planData.skipFoods?.length ? planData.skipFoods : [{ name: '', reason: '' }])
      setMustEatFoods(planData.mustEatFoods?.length ? planData.mustEatFoods : [{ name: '', reason: '' }])
      setExercises(exerciseData.exercises?.length ? exerciseData.exercises : [{ name: '', description: '' }])
      setLoading(false)
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    await Promise.all([
      fetch('/api/trainer/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise_desc: '',
          exercise_mins: parseInt(exerciseMins) || null,
          sleep_hours: parseFloat(sleepHours) || null,
          daily_quote: quote,
          weight_interval_days: parseInt(weightInterval) || 3,
          skipFoods: skipFoods.filter(f => f.name.trim()),
          mustEatFoods: mustEatFoods.filter(f => f.name.trim()),
        }),
      }),
      fetch('/api/exercise-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercises: exercises.filter(e => e.name.trim()) }),
      }),
    ])
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Skeleton helper component for shimmering elements
  const Skeleton = ({ className }: { className: string }) => (
    <div className={`animate-pulse bg-zinc-800/60 rounded ${className}`} />
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] pb-32">
        {/* Header Skeleton */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 sticky top-0 z-10">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">📋 My Plan</h1>
            <div className="w-10 h-4 bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>

        {/* Content Skeleton matches main layout cards */}
        <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-4 w-3/4 px-1" />

          {/* Motivation card skeleton */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>

          {/* Sleep card skeleton */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>

          {/* Weight check-in schedule skeleton */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-3">
            <Skeleton className="h-5 w-36" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          </div>

          {/* Exercises card skeleton */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
            <Skeleton className="h-4 w-28 mt-2" />
          </div>

          {/* Skip foods skeleton */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
            <Skeleton className="h-4 w-24 mt-2" />
          </div>

          {/* Must eat skeleton */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-3">
            <Skeleton className="h-5 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
            <Skeleton className="h-4 w-24 mt-2" />
          </div>
        </div>

        {/* Floating action button skeleton */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-zinc-800 p-4">
          <div className="max-w-lg mx-auto">
            <Skeleton className="w-full h-[60px] rounded-2xl" />
          </div>
        </div>
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
            className="text-rose-400 font-medium text-sm">Home</button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        <p className="text-xs text-zinc-500 px-1">
          Customize everything — your targets, quote, foods, and exercises.
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

        {/* Weight interval */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <h2 className="font-semibold text-white mb-3">⚖️ Check-in Schedule</h2>
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
        </div>

        {/* Exercise plan */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <h2 className="font-semibold text-white mb-3">🏃 Exercise Plan</h2>
          <div className="space-y-3">
            {exercises.map((ex, i) => (
              <div key={i} className="space-y-1.5">
                <input
                  value={ex.name}
                  onChange={e => setExercises(prev => prev.map((x, idx) =>
                    idx === i ? { ...x, name: e.target.value } : x))}
                  placeholder="Exercise name (e.g. Morning Walk)"
                  className={inputCls}
                />
                <input
                  value={ex.description}
                  onChange={e => setExercises(prev => prev.map((x, idx) =>
                    idx === i ? { ...x, description: e.target.value } : x))}
                  placeholder="Description / duration (e.g. 30 min brisk walk)"
                  className={inputCls}
                />
                {exercises.length > 1 && (
                  <button
                    onClick={() => setExercises(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-red-400 text-xs"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => setExercises(prev => [...prev, { name: '', description: '' }])}
            className="mt-3 text-rose-400 text-sm font-medium"
          >
            + Add exercise
          </button>
        </div>

        {/* Skip foods */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-red-500/20">
          <h2 className="font-semibold text-white mb-3">🚫 Foods to Skip</h2>
          <div className="space-y-3">
            {skipFoods.map((food, i) => (
              <div key={i} className="space-y-1.5">
                <input
                  value={food.name}
                  onChange={e => setSkipFoods(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, name: e.target.value } : f))}
                  placeholder="Food name"
                  className={inputCls}
                />
                <input
                  value={food.reason}
                  onChange={e => setSkipFoods(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, reason: e.target.value } : f))}
                  placeholder="Why to skip it"
                  className={inputCls}
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

        {/* Must eat foods */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-green-500/20">
          <h2 className="font-semibold text-white mb-3">✅ Must Eat</h2>
          <div className="space-y-3">
            {mustEatFoods.map((food, i) => (
              <div key={i} className="space-y-1.5">
                <input
                  value={food.name}
                  onChange={e => setMustEatFoods(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, name: e.target.value } : f))}
                  placeholder="Food name"
                  className={inputCls}
                />
                <input
                  value={food.reason}
                  onChange={e => setMustEatFoods(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, reason: e.target.value } : f))}
                  placeholder="Why it helps"
                  className={inputCls}
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

      </div>

      {/* Sticky save */}
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