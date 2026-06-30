'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPage() {
  const [step, setStep] = useState<'confirm' | 'type'>('confirm')
  const [typed, setTyped] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleReset() {
    if (typed !== 'RESET') {
      setError('Type RESET exactly to confirm')
      return
    }
    setLoading(true)
    const res = await fetch('/api/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: 'RESET' }),
    })
   if (res.ok) {
  router.push('/welcome')   // was '/setup'
} else {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] px-6">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white">Reset Everything</h1>
          <p className="text-zinc-500 mt-2 text-sm">
            This will permanently delete all data — user, logs, weight, measurements, everything.
            This cannot be undone.
          </p>
        </div>

        {step === 'confirm' && (
          <div className="space-y-3">
            <button
              onClick={() => setStep('type')}
              className="w-full py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-semibold active:scale-95 transition"
            >
              Yes, I want to reset
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3 rounded-2xl bg-zinc-900 border border-zinc-700 text-zinc-400 font-semibold active:scale-95 transition"
            >
              Cancel
            </button>
          </div>
        )}

        {step === 'type' && (
          <div className="space-y-4">
            <p className="text-zinc-400 text-sm text-center">
              Type <span className="text-red-400 font-bold">RESET</span> to confirm
            </p>
            <input
              type="text"
              value={typed}
              onChange={e => { setTyped(e.target.value); setError('') }}
              placeholder="Type RESET"
              className="w-full px-4 py-3 rounded-2xl border border-red-500/30 bg-zinc-900 text-white text-center text-lg tracking-widest placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              onClick={handleReset}
              disabled={loading || typed !== 'RESET'}
              className="w-full py-3 rounded-2xl bg-red-500 text-white font-bold disabled:opacity-40 active:scale-95 transition"
            >
              {loading ? 'Resetting...' : 'Reset Everything'}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-2 text-zinc-500 text-sm"
            >
              Cancel
            </button>
          </div>
        )}

      </div>
    </div>
  )
}