'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, pin }),
    })
    if (res.ok) {
      router.push('/dashboard')
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🔑</div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-zinc-500 mt-2 text-sm">Sign in with your username and PIN</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={e => { setUsername(e.target.value.toLowerCase().replace(/\s/g, '')); setError(false) }}
            placeholder="Username"
            className="w-full px-4 py-3 rounded-2xl border border-zinc-700 bg-zinc-900 text-white text-lg placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
          />
          <input
            type="password"
            value={pin}
            onChange={e => { setPin(e.target.value); setError(false) }}
            placeholder="• • • • • •"
            className="w-full px-4 py-4 rounded-2xl border border-zinc-700 bg-zinc-900 text-white text-center text-2xl tracking-widest placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
            maxLength={8}
          />
          {error && <p className="text-red-400 text-sm text-center">Wrong username or PIN. Try again.</p>}
          <button
            type="submit"
            disabled={loading || !pin || !username}
            className="w-full py-3 rounded-2xl bg-rose-500 text-white text-lg font-semibold disabled:opacity-40 active:scale-95 transition"
          >
            {loading ? 'Checking...' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/welcome')}
            className="w-full py-2 text-zinc-500 text-sm"
          >
            Back
          </button>
        </form>
      </div>
    </div>
  )
}