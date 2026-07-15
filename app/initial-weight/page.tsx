'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function InitialWeightPage() {
  const [weight, setWeight] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!weight) return
    setLoading(true)
    await fetch('/api/initial-weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight_kg: parseFloat(weight) }),
    })
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⚖️</div>
          <h1 className="text-2xl font-bold text-white">Starting Weight</h1>
          <p className="text-zinc-500 mt-2 text-sm">
            Let's log where you're starting from — this helps track your progress over time
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="Weight in kg"
            className="w-full px-4 py-4 rounded-2xl border border-zinc-700 bg-zinc-900 text-white text-center text-2xl placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !weight}
            className="w-full py-3 rounded-2xl bg-rose-500 text-white text-lg font-semibold disabled:opacity-40 active:scale-95 transition"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}