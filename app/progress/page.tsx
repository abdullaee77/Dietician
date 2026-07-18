
// 'use client'

// import { format, parseISO } from 'date-fns'
// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import {
//   LineChart, Line, BarChart, Bar,
//   XAxis, YAxis, CartesianGrid, Tooltip,
//   ResponsiveContainer, Legend, Cell
// } from 'recharts'
// import StreakBadge from '@/components/StreakBadge'

// const tooltipStyle = {
//   backgroundColor: '#18181b',
//   border: '1px solid #3f3f46',
//   borderRadius: '12px',
//   color: '#f4f4f5',
//   fontSize: 12,
// }

// function timeToDecimal(t: string): number | null {
//   if (!t) return null
//   const [h, m] = t.split(':').map(Number)
//   return h + m / 60
// }

// function formatHour(val: number): string {
//   const h = Math.floor(val)
//   const m = Math.round((val - h) * 60)
//   const period = h >= 12 ? 'PM' : 'AM'
//   const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h
//   return `${displayH}:${String(m).padStart(2, '0')} ${period}`
// }

// export default function ProgressPage() {
//   const [data, setData] = useState<any>(null)
//   const [loading, setLoading] = useState(true)
//   const router = useRouter()
//   const [complianceData, setComplianceData] = useState<any[]>([])
// const [selectedCompliance, setSelectedCompliance] = useState<any>(null)
// const [activeDetailMode, setActiveDetailMode] = useState<'food' | 'exercise' | null>(null)
//   useEffect(() => {
//     fetch('/api/progress')
//       .then(r => {
//         if (r.status === 401) {
//           router.push('/login')
//           return null
//         }
//         return r.json()
//       })
//       .then(d => {
//         if (!d) return
//         setData(d)
//         setLoading(false)
//         fetch('/api/compliance-history')
//   .then(r => r.json())
//   .then(d => setComplianceData(d.data ?? []))
//       })
//   }, [router])
// useEffect(() => {
//   if (selectedCompliance && activeDetailMode) {
//     document.body.style.overflow = 'hidden'
//   } else {
//     document.body.style.overflow = ''
//   }
//   return () => { document.body.style.overflow = '' }
// }, [selectedCompliance, activeDetailMode])

//   // Helper Skeleton component for shimmer effect
//   const Skeleton = ({ className }: { className: string }) => (
//     <div className={`animate-pulse bg-zinc-800/60 rounded ${className}`} />
//   )

//   // 1. Render Skeleton UI while loading
//   if (loading || !data) {
//     return (
//       <div className="min-h-screen bg-[#0f0f0f] pb-24">
//         {/* Header Skeleton */}
//         <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 sticky top-0 z-10">
//           <div className="max-w-lg mx-auto flex items-center justify-between">
//             <h1 className="text-xl font-bold text-white">📈 Progress</h1>
//             <div className="w-10 h-4 bg-zinc-800 rounded animate-pulse" />
//           </div>
//         </div>

//         <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
//           {/* Streaks Skeleton */}
//           <div className="grid grid-cols-2 gap-3">
//             {[1, 2, 3, 4].map((i) => (
//               <div key={i} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex items-center gap-3 h-[72px]">
//                 <Skeleton className="w-10 h-10 rounded-xl" />
//                 <div className="space-y-2 flex-1">
//                   <Skeleton className="h-3 w-16" />
//                   <Skeleton className="h-4 w-8" />
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Calendar Skeleton */}
//           <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
//             <Skeleton className="h-5 w-32 mb-4" />
//             <div className="grid grid-cols-10 gap-1.5">
//               {Array.from({ length: 30 }).map((_, i) => (
//                 <Skeleton key={i} className="w-full aspect-square rounded-md" />
//               ))}
//             </div>
//             <div className="flex gap-4 mt-4">
//               <Skeleton className="h-3 w-20" />
//               <Skeleton className="h-3 w-16" />
//             </div>
//             <Skeleton className="h-16 w-full rounded-2xl mt-7" />
//           </div>

//           {/* Multi-Chart Skeleton Cards */}
//           {[1, 2, 3, 4, 5].map((i) => (
//             <div key={i} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
//               <Skeleton className="h-5 w-36 mb-6" />
//               <div className="h-[180px] flex items-end gap-3 px-2">
//                 <Skeleton className="w-full h-[30%]" />
//                 <Skeleton className="w-full h-[60%]" />
//                 <Skeleton className="w-full h-[45%]" />
//                 <Skeleton className="w-full h-[80%]" />
//                 <Skeleton className="w-full h-[55%]" />
//                 <Skeleton className="w-full h-[70%]" />
//                 <Skeleton className="w-full h-[90%]" />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     )
//   }

//   // 2. Safely unpack arrays with secure fallbacks
//   const weights = data.weights ?? []
//   const water = data.waterData ?? []
//   const mealTimes = data.mealTimesData ?? []
//   const sleep = data.sleepData ?? []
//   const submitData = data.submitData ?? []
//   const stepsData = data.stepsData ?? []

//   // 3. Transform data for charts
//   const weightData = weights.map((w: any) => ({
//     date: format(parseISO(w.date), 'MMM d'),
//     weight: Number(w.weight_kg),
//   }))

//   const waterData = water.slice(-14).map((w: any) => ({
//     date: format(parseISO(w.date), 'MMM d'),
//     glasses: w.glasses,
//   }))

//   const mealTimesData = mealTimes.slice(-14).map((m: any) => ({
//     date: format(parseISO(m.date), 'MMM d'),
//     breakfast: timeToDecimal(m.breakfast),
//     lunch: timeToDecimal(m.lunch),
//     dinner: timeToDecimal(m.dinner),
//   })).filter((m: any) => m.breakfast || m.lunch || m.dinner)

//   const sleepData = sleep.slice(-14).map((s: any) => ({
//     date: format(parseISO(s.date), 'MMM d'),
//     hours: s.hours,
//   }))

//   const stepsChartData = stepsData.slice(-14).map((s: any) => ({
//     date: format(parseISO(s.date), 'MMM d'),
//     steps: s.steps,
//   }))

//   return (
//     <div className="min-h-screen bg-[#0f0f0f] pb-24">
//       <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 sticky top-0 z-10">
//         <div className="max-w-lg mx-auto flex items-center justify-between">
//           <h1 className="text-xl font-bold text-white">📈 Progress</h1>
//           <button onClick={() => router.push('/dashboard')}
//             className="text-rose-400 font-medium text-sm">Home</button>
//         </div>
//       </div>

//       <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

//         {/* Streaks */}
//         <div className="grid grid-cols-2 gap-3">
//           <StreakBadge label="Day Streak" emoji="🔥" count={data.streak ?? 0} color="bg-zinc-900 text-orange-400" />
//           <StreakBadge label="Total Days" emoji="📅" count={data.totalDays ?? 0} color="bg-zinc-900 text-rose-400" />
//           <StreakBadge label="Water Goal" emoji="💧" count={data.waterStreak ?? 0} color="bg-zinc-900 text-blue-400" />
//           <StreakBadge label="Steps Goal" emoji="👟" count={data.stepsStreak ?? 0} color="bg-zinc-900 text-green-400" />
//         </div>

//         {/* Submit streak calendar */}
//         <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
//           <h2 className="font-semibold text-white mb-4">📆 Submit Streak</h2>
//           <div className="grid grid-cols-10 gap-1.5">
//             {submitData.map((d: any) => (
//               <div
//                 key={d.date}
//                 title={format(parseISO(d.date), 'MMM d')}
//                 className={`w-full aspect-square rounded-md ${
//                   d.completed ? 'bg-rose-500' : 'bg-zinc-800'
//                 }`}
//               />
//             ))}
//           </div>
//           <div className="flex gap-4 mt-3 text-xs text-zinc-500">
//             <span className="flex items-center gap-1">
//               <span className="w-3 h-3 rounded bg-rose-500 inline-block" /> Completed
//             </span>
//             <span className="flex items-center gap-1">
//               <span className="w-3 h-3 rounded bg-zinc-800 inline-block" /> Missed
//             </span>
//           </div>
//           <br />
//           {/* History link */}
//           <button
//             onClick={() => router.push('/history')}
//             className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between active:scale-95 transition hover:border-rose-500/30"
//           >
//             <div className="text-left">
//               <p className="text-white font-semibold text-sm">📖 Check Your History</p>
//               <p className="text-zinc-500 text-xs mt-1">View your daily logs month by month</p>
//             </div>
//             <span className="text-zinc-500 text-lg">›</span>
//           </button>
//         </div>

// {/* Food & Exercise Compliance */}
// {complianceData.length > 0 && (
//   <div className="space-y-6">
    
//     {/* 1. FOOD COMPLIANCE SECTION */}
//     <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
//       <div className="flex justify-between items-center mb-1">
//         <h2 className="font-semibold text-white">🍽️ Food Compliance Grid</h2>
//         <span className="text-[11px] text-zinc-500">Last {complianceData.length} days</span>
//       </div>
//       <p className="text-xs text-zinc-500 mb-4">Tap a square to view food entry details</p>
      
//       <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
//         {complianceData.map((day: any) => {
//           const totalChecks = day.foodChecks.length
//           const foodPassed = day.foodChecks.filter((f: any) => f.complied).length
          
//           // Determine color: grey if no data, green if all followed, red if any violation
//           let statusColor = 'bg-zinc-800 hover:bg-zinc-700'
//           if (totalChecks > 0) {
//             statusColor = foodPassed === totalChecks 
//               ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.3)] hover:bg-green-400' 
//               : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.3)] hover:bg-red-400'
//           }

//           return (
//             <button
//               key={`food-${day.date}`}
//               onClick={() => setSelectedCompliance(day)}
//               title={`${format(parseISO(day.date), 'MMM d')}: ${foodPassed}/${totalChecks} followed`}
//               className={`w-full aspect-square rounded-lg transition-all active:scale-90 ${statusColor}`}
//             />
//           )
//         })}
//       </div>
//       <div className="flex gap-4 mt-4 text-[11px] text-zinc-500">
//         <span className="flex items-center gap-1">
//           <span className="w-2.5 h-2.5 rounded bg-green-500 inline-block" /> 100% Followed
//         </span>
//         <span className="flex items-center gap-1">
//           <span className="w-2.5 h-2.5 rounded bg-red-500 inline-block" /> Has Violations
//         </span>
//         <span className="flex items-center gap-1">
//           <span className="w-2.5 h-2.5 rounded bg-zinc-800 inline-block" /> No Logs
//         </span>
//       </div>
//     </div>

//     {/* 2. EXERCISE COMPLIANCE SECTION */}
//     <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
//       <div className="flex justify-between items-center mb-1">
//         <h2 className="font-semibold text-white">🏃 Exercise Compliance Grid</h2>
//         <span className="text-[11px] text-zinc-500">Last {complianceData.length} days</span>
//       </div>
//       <p className="text-xs text-zinc-500 mb-4">Tap a square to view exercise details</p>
      
//       <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
//         {complianceData.map((day: any) => {
//           const totalExercises = day.exercises.length
//           const exCompleted = day.exercises.filter((e: any) => e.completed).length
          
//           // Determine color: grey if no data, green if all done, red if any missed
//           let statusColor = 'bg-zinc-800 hover:bg-zinc-700'
//           if (totalExercises > 0) {
//             statusColor = exCompleted === totalExercises 
//               ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.3)] hover:bg-green-400' 
//               : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.3)] hover:bg-red-400'
//           }

//           return (
//             <button
//               key={`exercise-${day.date}`}
//               onClick={() => setSelectedCompliance(day)}
//               title={`${format(parseISO(day.date), 'MMM d')}: ${exCompleted}/${totalExercises} completed`}
//               className={`w-full aspect-square rounded-lg transition-all active:scale-90 ${statusColor}`}
//             />
//           )
//         })}
//       </div>
//       <div className="flex gap-4 mt-4 text-[11px] text-zinc-500">
//         <span className="flex items-center gap-1">
//           <span className="w-2.5 h-2.5 rounded bg-green-500 inline-block" /> 100% Done
//         </span>
//         <span className="flex items-center gap-1">
//           <span className="w-2.5 h-2.5 rounded bg-red-500 inline-block" /> Missed Tasks
//         </span>
//         <span className="flex items-center gap-1">
//           <span className="w-2.5 h-2.5 rounded bg-zinc-800 inline-block" /> No Routine
//         </span>
//       </div>
//     </div>

//   </div>
// )}

//         {/* Weight chart */}
//         <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
//           <h2 className="font-semibold text-white mb-4">⚖️ Weight (kg)</h2>
//           {weightData.length === 0 ? (
//             <div className="flex flex-col items-center py-10 text-zinc-600">
//               <p className="text-4xl mb-2">⚖️</p>
//               <p className="text-sm">No weight entries yet</p>
//             </div>
//           ) : (
//             <ResponsiveContainer width="100%" height={200}>
//               <LineChart data={weightData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//                 <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717a' }} />
//                 <YAxis tick={{ fontSize: 11, fill: '#71717a' }} domain={['auto', 'auto']} />
//                 <Tooltip contentStyle={tooltipStyle} />
//                 <Line
//                   type="monotone"
//                   dataKey="weight"
//                   stroke="#f43f5e"
//                   strokeWidth={2.5}
//                   dot={{ fill: '#f43f5e', r: 4 }}
//                   activeDot={{ r: 6 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           )}
//         </div>

//         {/* Water chart */}
//         <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
//           <h2 className="font-semibold text-white mb-4">💧 Water Intake</h2>
//           {waterData.length === 0 ? (
//             <div className="flex flex-col items-center py-10 text-zinc-600">
//               <p className="text-4xl mb-2">💧</p>
//               <p className="text-sm">No data yet</p>
//             </div>
//           ) : (
//             <ResponsiveContainer width="100%" height={180}>
//               <BarChart data={waterData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//                 <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} />
//                 <YAxis tick={{ fontSize: 11, fill: '#71717a' }} domain={[0, 12]} />
//                 <Tooltip contentStyle={tooltipStyle} />
//                 <Bar dataKey="glasses" radius={[6, 6, 0, 0]}>
//                   {waterData.map((entry: any, i: number) => (
//                     <Cell key={i}
//                       fill={entry.glasses >= 8 ? '#3b82f6' : '#1d4ed8'}
//                       opacity={entry.glasses >= 8 ? 1 : 0.5}
//                     />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           )}
//           <p className="text-xs text-zinc-600 mt-2">Bright = 8+ glasses ✓</p>
//         </div>

//         {/* Meal times chart */}
//         <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
//           <h2 className="font-semibold text-white mb-4">🍽️ Meal Times</h2>
//           {mealTimesData.length === 0 ? (
//             <div className="flex flex-col items-center py-10 text-zinc-600">
//               <p className="text-4xl mb-2">🍽️</p>
//               <p className="text-sm">No meal time data yet</p>
//             </div>
//           ) : (
//             <ResponsiveContainer width="100%" height={200}>
//               <LineChart data={mealTimesData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//                 <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} />
//                 <YAxis
//                   tick={{ fontSize: 10, fill: '#71717a' }}
//                   domain={[6, 23]}
//                   tickFormatter={formatHour}
//                 />
//                 <Tooltip
//                   contentStyle={tooltipStyle}
//                   formatter={(val: any) => val ? formatHour(val) : 'Skipped'}
//                 />
//                 <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: 12 }} />
//                 <Line type="monotone" dataKey="breakfast" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
//                 <Line type="monotone" dataKey="lunch" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
//                 <Line type="monotone" dataKey="dinner" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
//               </LineChart>
//             </ResponsiveContainer>
//           )}
//         </div>

//         {/* Sleep chart */}
//         <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
//           <h2 className="font-semibold text-white mb-4">😴 Sleep Hours</h2>
//           {sleepData.length === 0 ? (
//             <div className="flex flex-col items-center py-10 text-zinc-600">
//               <p className="text-4xl mb-2">😴</p>
//               <p className="text-sm">No sleep data yet</p>
//             </div>
//           ) : (
//             <ResponsiveContainer width="100%" height={180}>
//               <BarChart data={sleepData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//                 <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} />
//                 <YAxis tick={{ fontSize: 11, fill: '#71717a' }} domain={[0, 12]} />
//                 <Tooltip contentStyle={tooltipStyle} />
//                 <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
//                   {sleepData.map((entry: any, i: number) => (
//                     <Cell key={i}
//                       fill={entry.hours >= 7 ? '#8b5cf6' : '#4c1d95'}
//                       opacity={entry.hours >= 7 ? 1 : 0.5}
//                     />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           )}
//           <p className="text-xs text-zinc-600 mt-2">Bright = 7+ hours ✓</p>
//         </div>

//         {/* Steps chart */}
//         <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
//           <h2 className="font-semibold text-white mb-4">👟 Daily Steps</h2>
//           {stepsChartData.length === 0 ? (
//             <div className="flex flex-col items-center py-10 text-zinc-600">
//               <p className="text-4xl mb-2">👟</p>
//               <p className="text-sm">No steps data yet</p>
//             </div>
//           ) : (
//             <ResponsiveContainer width="100%" height={180}>
//               <BarChart data={stepsChartData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//                 <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} />
//                 <YAxis tick={{ fontSize: 11, fill: '#71717a' }} />
//                 <Tooltip contentStyle={tooltipStyle} />
//                 <Bar dataKey="steps" radius={[6, 6, 0, 0]}>
//                   {stepsChartData.map((entry: any, i: number) => (
//                     <Cell key={i}
//                       fill={entry.steps >= 8000 ? '#10b981' : '#059669'}
//                       opacity={entry.steps >= 8000 ? 1 : 0.5}
//                     />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           )}
//           <p className="text-xs text-zinc-600 mt-2">Bright green = 8,000+ steps ✓</p>
//         </div>

//       </div>
//       {selectedCompliance && (
//   <div
//     className="fixed inset-0 z-50 flex items-end justify-center"
//     style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
//     onClick={() => setSelectedCompliance(null)}
//   >
//     <div
//       className="bg-zinc-900 rounded-t-3xl w-full max-w-lg border-t border-zinc-700 overflow-y-auto"
//       style={{ maxHeight: '75vh' }}
//       onClick={e => e.stopPropagation()}
//     >
//       <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900">
//         <h3 className="text-white font-bold">
//           {format(parseISO(selectedCompliance.date), 'EEEE, MMM d')}
//         </h3>
//         <button
//           onClick={() => setSelectedCompliance(null)}
//           className="text-zinc-500 text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800"
//         >×</button>
//       </div>

//       <div className="px-5 py-4 space-y-5">

//         {selectedCompliance.foodChecks.length > 0 && (
//           <div>
//             <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium mb-2">📋 Food Check</p>
//             <div className="space-y-2">
//               {selectedCompliance.foodChecks.map((f: any, i: number) => (
//                 <div key={i} className={`rounded-xl px-3 py-2.5 flex items-center justify-between ${
//                   f.complied ? 'bg-green-500/10' : 'bg-red-500/10'
//                 }`}>
//                   <div className="min-w-0 flex-1">
//                     <p className="text-zinc-200 text-sm truncate">{f.food_name}</p>
//                     <p className="text-zinc-500 text-xs">
//                       {f.food_type === 'skip' ? '🚫 Should skip' : '✅ Should eat'}
//                     </p>
//                   </div>
//                   <span className={`ml-3 shrink-0 text-xs font-semibold px-2 py-1 rounded-lg ${
//                     f.complied ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
//                   }`}>
//                     {f.complied ? 'Followed ✓' : 'Violated ✕'}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {selectedCompliance.exercises.length > 0 && (
//           <div>
//             <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium mb-2">🏃 Exercise</p>
//             <div className="space-y-2">
//               {selectedCompliance.exercises.map((ex: any, i: number) => (
//                 <div key={i} className={`rounded-xl px-3 py-2.5 flex items-center justify-between ${
//                   ex.completed ? 'bg-green-500/10' : 'bg-red-500/10'
//                 }`}>
//                   <div className="min-w-0 flex-1">
//                     <p className="text-zinc-200 text-sm truncate">{ex.exercise_name}</p>
//                     {ex.exercise_desc && (
//                       <p className="text-zinc-500 text-xs truncate">{ex.exercise_desc}</p>
//                     )}
//                   </div>
//                   <span className={`ml-3 shrink-0 text-xs font-semibold px-2 py-1 rounded-lg ${
//                     ex.completed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
//                   }`}>
//                     {ex.completed ? 'Done ✓' : 'Missed ✕'}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         <div className="h-4" />
//       </div>
//     </div>
//   </div>
// )}
//     </div>
//   )
// }
'use client'

import { format, parseISO } from 'date-fns'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell
} from 'recharts'
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
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [complianceData, setComplianceData] = useState<any[]>([])
  
  // Isolated layout control states
  const [selectedCompliance, setSelectedCompliance] = useState<any>(null)
  const [activeDetailMode, setActiveDetailMode] = useState<'food' | 'exercise' | null>(null)

  useEffect(() => {
    fetch('/api/progress')
      .then(r => {
        if (r.status === 401) {
          router.push('/login')
          return null
        }
        return r.json()
      })
      .then(d => {
        if (!d) return
        setData(d)
        setLoading(false)
        fetch('/api/compliance-history')
          .then(r => r.json())
          .then(d => setComplianceData(d.data ?? []))
      })
  }, [router])

  useEffect(() => {
    if (selectedCompliance && activeDetailMode) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [selectedCompliance, activeDetailMode])

  const Skeleton = ({ className }: { className: string }) => (
    <div className={`animate-pulse bg-zinc-800/60 rounded ${className}`} />
  )

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] pb-24">
        <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 sticky top-0 z-10">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">📈 Progress</h1>
            <div className="w-10 h-4 bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex items-center gap-3 h-[72px]">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="grid grid-cols-10 gap-1.5">
              {Array.from({ length: 30 }).map((_, i) => (
                <Skeleton key={i} className="w-full aspect-square rounded-md" />
              ))}
            </div>
            <div className="flex gap-4 mt-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-16 w-full rounded-2xl mt-7" />
          </div>

          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <Skeleton className="h-5 w-36 mb-6" />
              <div className="h-[180px] flex items-end gap-3 px-2">
                <Skeleton className="w-full h-[30%]" />
                <Skeleton className="w-full h-[60%]" />
                <Skeleton className="w-full h-[45%]" />
                <Skeleton className="w-full h-[80%]" />
                <Skeleton className="w-full h-[55%]" />
                <Skeleton className="w-full h-[70%]" />
                <Skeleton className="w-full h-[90%]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const weights = data.weights ?? []
  const water = data.waterData ?? []
  const mealTimes = data.mealTimesData ?? []
  const sleep = data.sleepData ?? []
  const submitData = data.submitData ?? []
  const stepsData = data.stepsData ?? []

  const weightData = weights.map((w: any) => ({
    date: format(parseISO(w.date), 'MMM d'),
    weight: Number(w.weight_kg),
  }))

  const waterData = water.slice(-14).map((w: any) => ({
    date: format(parseISO(w.date), 'MMM d'),
    glasses: w.glasses,
  }))

  const mealTimesData = mealTimes.slice(-14).map((m: any) => ({
    date: format(parseISO(m.date), 'MMM d'),
    breakfast: timeToDecimal(m.breakfast),
    lunch: timeToDecimal(m.lunch),
    dinner: timeToDecimal(m.dinner),
  })).filter((m: any) => m.breakfast || m.lunch || m.dinner)

  const sleepData = sleep.slice(-14).map((s: any) => ({
    date: format(parseISO(s.date), 'MMM d'),
    hours: s.hours,
  }))

  const stepsChartData = stepsData.slice(-14).map((s: any) => ({
    date: format(parseISO(s.date), 'MMM d'),
    steps: s.steps,
  }))

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-24">
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">📈 Progress</h1>
          <button onClick={() => router.push('/dashboard')}
            className="text-rose-400 font-medium text-sm">Home</button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* Streaks */}
        <div className="grid grid-cols-2 gap-3">
          <StreakBadge label="Day Streak" emoji="🔥" count={data.streak ?? 0} color="bg-zinc-900 text-orange-400" />
          <StreakBadge label="Total Days" emoji="📅" count={data.totalDays ?? 0} color="bg-zinc-900 text-rose-400" />
          <StreakBadge label="Water Goal" emoji="💧" count={data.waterStreak ?? 0} color="bg-zinc-900 text-blue-400" />
          <StreakBadge label="Steps Goal" emoji="👟" count={data.stepsStreak ?? 0} color="bg-zinc-900 text-green-400" />
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
          <br />
          <button
            onClick={() => router.push('/history')}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between active:scale-95 transition hover:border-rose-500/30"
          >
            <div className="text-left">
              <p className="text-white font-semibold text-sm">📖 Check Your History</p>
              <p className="text-zinc-500 text-xs mt-1">View your daily logs month by month</p>
            </div>
            <span className="text-zinc-500 text-lg">›</span>
          </button>
        </div>

        {/* Food & Exercise Compliance Separate Sections */}
        {complianceData.length > 0 && (
          <div className="space-y-6">
            
            {/* 1. FOOD GRID */}
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <div className="flex justify-between items-center mb-1">
                <h2 className="font-semibold text-white">🍽️ Food Compliance Grid</h2>
                <span className="text-[11px] text-zinc-500">Last {complianceData.length} days</span>
              </div>
              <p className="text-xs text-zinc-500 mb-4">Tap a square to view food entry details</p>
              
              <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
                {complianceData.map((day: any) => {
                  const totalChecks = day.foodChecks?.length ?? 0
                  const foodPassed = day.foodChecks?.filter((f: any) => f.complied).length ?? 0
                  
                  let statusColor = 'bg-zinc-800 hover:bg-zinc-700'
                  if (totalChecks > 0) {
                    statusColor = foodPassed === totalChecks 
                      ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.3)] hover:bg-green-400' 
                      : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.3)] hover:bg-red-400'
                  }

                  return (
                    <button
                      key={`food-${day.date}`}
                      type="button"
                      onClick={() => {
                        setSelectedCompliance(day)
                        setActiveDetailMode('food')
                      }}
                      title={`${format(parseISO(day.date), 'MMM d')}: ${foodPassed}/${totalChecks} followed`}
                      className={`w-full aspect-square rounded-lg transition-all active:scale-90 ${statusColor}`}
                    />
                  )
                })}
              </div>
              <div className="flex gap-4 mt-4 text-[11px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-green-500 inline-block" /> 100% Followed
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-red-500 inline-block" /> Has Violations
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-zinc-800 inline-block" /> No Logs
                </span>
              </div>
            </div>

            {/* 2. EXERCISE GRID */}
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <div className="flex justify-between items-center mb-1">
                <h2 className="font-semibold text-white">🏃 Exercise Compliance Grid</h2>
                <span className="text-[11px] text-zinc-500">Last {complianceData.length} days</span>
              </div>
              <p className="text-xs text-zinc-500 mb-4">Tap a square to view exercise details</p>
              
              <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
                {complianceData.map((day: any) => {
                  const totalExercises = day.exercises?.length ?? 0
                  const exCompleted = day.exercises?.filter((e: any) => e.completed).length ?? 0
                  
                  let statusColor = 'bg-zinc-800 hover:bg-zinc-700'
                  if (totalExercises > 0) {
                    statusColor = exCompleted === totalExercises 
                      ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.3)] hover:bg-green-400' 
                      : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.3)] hover:bg-red-400'
                  }

                  return (
                    <button
                      key={`exercise-${day.date}`}
                      type="button"
                      onClick={() => {
                        setSelectedCompliance(day)
                        setActiveDetailMode('exercise')
                      }}
                      title={`${format(parseISO(day.date), 'MMM d')}: ${exCompleted}/${totalExercises} completed`}
                      className={`w-full aspect-square rounded-lg transition-all active:scale-90 ${statusColor}`}
                    />
                  )
                })}
              </div>
              <div className="flex gap-4 mt-4 text-[11px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-green-500 inline-block" /> 100% Done
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-red-500 inline-block" /> Missed Tasks
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-zinc-800 inline-block" /> No Routine
                </span>
              </div>
            </div>

          </div>
        )}

        {/* Weight chart */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <h2 className="font-semibold text-white mb-4">⚖️ Weight (kg)</h2>
          {weightData.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-zinc-600">
              <p className="text-4xl mb-2">⚖️</p>
              <p className="text-sm">No weight entries yet</p>
            </div>
          ) : (
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
                  dot={{ fill: '#f43f5e', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
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

        {/* Steps chart */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <h2 className="font-semibold text-white mb-4">👟 Daily Steps</h2>
          {stepsChartData.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-zinc-600">
              <p className="text-4xl mb-2">👟</p>
              <p className="text-sm">No steps data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stepsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="steps" radius={[6, 6, 0, 0]}>
                  {stepsChartData.map((entry: any, i: number) => (
                    <Cell key={i}
                      fill={entry.steps >= 8000 ? '#10b981' : '#059669'}
                      opacity={entry.steps >= 8000 ? 1 : 0.5}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <p className="text-xs text-zinc-600 mt-2">Bright green = 8,000+ steps ✓</p>
        </div>

      </div>

{/* Redesigned Isolated Bottom Drawer Card */}
      {selectedCompliance && activeDetailMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-all px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => {
            setSelectedCompliance(null)
            setActiveDetailMode(null)
          }}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-[28px] shadow-2xl overflow-y-auto max-h-[75vh] flex flex-col pb-6"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Layout */}
            <div className="flex items-start justify-between px-6 pb-4 pt-5 border-b border-zinc-800/60 sticky top-0 bg-zinc-900/90 backdrop-blur-md z-10">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                  {activeDetailMode === 'food' ? '🍽️ Nutrition Breakdown' : '🏃 Activity Summary'}
                </span>
                <h3 className="text-white text-lg font-bold mt-0.5">
                  {format(parseISO(selectedCompliance.date), 'EEEE, MMM d')}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedCompliance(null)
                  setActiveDetailMode(null)
                }}
                className="text-zinc-400 bg-zinc-800/50 hover:bg-zinc-800 text-lg w-8 h-8 flex items-center justify-center rounded-full border border-zinc-700/40 transition active:scale-90"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 flex-1 overflow-y-auto space-y-4">
              
              {activeDetailMode === 'food' && (
                <div className="space-y-2.5">
                  {selectedCompliance.foodChecks?.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-zinc-800 rounded-2xl">
                      <p className="text-2xl mb-1">🍽️</p>
                      <p className="text-sm text-zinc-400 font-medium">No food data logged for this day</p>
                    </div>
                  ) : (
                    selectedCompliance.foodChecks.map((f: any, i: number) => (
                      <div 
                        key={i} 
                        className={`border rounded-xl px-4 py-3 flex items-center justify-between transition-colors ${
                          f.complied 
                            ? 'bg-zinc-900 border-zinc-800/60 shadow-sm' 
                            : 'bg-red-950/20 border-red-900/40'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-zinc-100 font-semibold text-sm truncate">{f.food_name}</p>
                          <p className="text-zinc-500 text-xs mt-0.5 font-medium">
                            {f.food_type === 'skip' ? '🚫 Recommended to avoid' : '✅ Part of clean menu'}
                          </p>
                        </div>
                        <span className={`ml-4 shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          f.complied 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {f.complied ? 'Followed' : 'Violated'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeDetailMode === 'exercise' && (
                <div className="space-y-2.5">
                  {selectedCompliance.exercises?.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-zinc-800 rounded-2xl">
                      <p className="text-2xl mb-1">🏃</p>
                      <p className="text-sm text-zinc-400 font-medium">No exercises assigned for this day</p>
                    </div>
                  ) : (
                    selectedCompliance.exercises.map((ex: any, i: number) => (
                      <div 
                        key={i} 
                        className={`border rounded-xl px-4 py-3 flex items-center justify-between transition-colors ${
                          ex.completed 
                            ? 'bg-zinc-900 border-zinc-800/60 shadow-sm' 
                            : 'bg-red-950/20 border-red-900/40'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-zinc-100 font-semibold text-sm truncate">{ex.exercise_name}</p>
                          {ex.exercise_desc && (
                            <p className="text-zinc-500 text-xs mt-0.5 truncate font-normal">{ex.exercise_desc}</p>
                          )}
                        </div>
                        <span className={`ml-4 shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          ex.completed 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {ex.completed ? 'Done' : 'Missed'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  )
}