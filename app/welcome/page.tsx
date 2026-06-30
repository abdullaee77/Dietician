'use client'

import { useRouter } from 'next/navigation'

export default function WelcomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🌸</div>
          <h1 className="text-3xl font-bold text-white">Dietician</h1>
          <p className="text-zinc-500 mt-2">Your daily journey, tracked</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/setup')}
            className="w-full py-4 rounded-2xl bg-rose-500 text-white text-lg font-semibold active:scale-95 transition"
          >
            🌱 I'm new here
          </button>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-lg font-semibold active:scale-95 transition"
          >
            🔑 I already have an account
          </button>
        </div>
      </div>
    </div>
  )
}