'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'name' | 'pin'

export default function SetupPage() {
  const [step, setStep] = useState<Step>('name')
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setStep('pin')
  }

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pin !== confirmPin) {
      setError("PINs don't match")
      return
    }
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits')
      return
    }

    setLoading(true)
    const res = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, pin }),
    })

   if (res.ok) {
  router.push('/initial-weight')   // was '/dashboard'
} else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] px-6">
      <div className="w-full max-w-sm">

        <div className="flex justify-center gap-2 mb-10">
          {['name', 'pin'].map((s, i) => (
            <div key={s} className={`h-2 rounded-full transition-all ${
              step === s ? 'bg-rose-500 w-6' : i < ['name', 'pin'].indexOf(step) ? 'bg-rose-800 w-2' : 'bg-zinc-700 w-2'
            }`} />
          ))}
        </div>

        {step === 'name' && (
          <>
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🌸</div>
              <h1 className="text-2xl font-bold text-white">Welcome</h1>
              <p className="text-zinc-500 mt-2 text-sm">Let's get you set up</p>
            </div>
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  What's your name?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-2xl border border-zinc-700 bg-zinc-900 text-white text-lg placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full py-3 rounded-2xl bg-rose-500 text-white text-lg font-semibold disabled:opacity-40 active:scale-95 transition"
              >
                Next →
              </button>
              <button
                type="button"
                onClick={() => router.push('/welcome')}
                className="w-full py-2 text-zinc-500 text-sm"
              >
                ← Back
              </button>
            </form>
          </>
        )}

        {step === 'pin' && (
          <>
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🔐</div>
              <h1 className="text-2xl font-bold text-white">Set Your PIN</h1>
              <p className="text-zinc-500 mt-2 text-sm">
                Hi {name}! Choose a PIN — you'll use it to log in next time, even on a new device
              </p>
            </div>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Create PIN</label>
                <input
                  type="password"
                  value={pin}
                  onChange={e => { setPin(e.target.value); setError('') }}
                  placeholder="• • • • • •"
                  className="w-full px-4 py-3 rounded-2xl border border-zinc-700 bg-zinc-900 text-white text-center text-2xl tracking-widest placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  maxLength={8}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Confirm PIN</label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={e => { setConfirmPin(e.target.value); setError('') }}
                  placeholder="• • • • • •"
                  className="w-full px-4 py-3 rounded-2xl border border-zinc-700 bg-zinc-900 text-white text-center text-2xl tracking-widest placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  maxLength={8}
                />
              </div>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading || !pin || !confirmPin}
                className="w-full py-3 rounded-2xl bg-rose-500 text-white text-lg font-semibold disabled:opacity-40 active:scale-95 transition"
              >
                {loading ? 'Setting up...' : "Let's go 🌸"}
              </button>
              <button
                type="button"
                onClick={() => setStep('name')}
                className="w-full py-2 text-zinc-500 text-sm"
              >
                ← Back
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  )
}