// 'use client'

// import { useRouter } from 'next/navigation'

// export default function WelcomePage() {
//   const router = useRouter()

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] px-6">
//       <div className="w-full max-w-sm">
//         <div className="text-center mb-12">
//           <div className="text-6xl mb-4">🌸</div>
//           <h1 className="text-3xl font-bold text-white">Dietician</h1>
//           <p className="text-zinc-500 mt-2">Your daily journey, tracked</p>
//         </div>

//         <div className="space-y-3">
//           <button
//             onClick={() => router.push('/setup')}
//             className="w-full py-4 rounded-2xl bg-rose-500 text-white text-lg font-semibold active:scale-95 transition"
//           >
//             🌱 I'm new here
//           </button>
//           <button
//             onClick={() => router.push('/login')}
//             className="w-full py-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-lg font-semibold active:scale-95 transition"
//           >
//             🔑 I already have an account
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'

import { useRouter } from 'next/navigation'

export default function WelcomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-6 relative overflow-hidden">
      {/* Ambient Pink Glows in Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-sm z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500/20 to-rose-500/5 border border-pink-500/20 shadow-[0_0_30px_rgba(244,63,94,0.15)] text-4xl mb-6 animate-pulse">
            🌸
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-pink-200">
            Dietician
          </h1>
          <p className="text-zinc-400 font-medium mt-3 tracking-wide text-sm">
            Your daily journey, <span className="text-pink-400">tracked beautifully</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => router.push('/setup')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-base font-semibold shadow-[0_4px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_4px_25px_rgba(244,63,94,0.45)] hover:opacity-95 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>🌱</span> I'm new here
          </button>
          
          <button
            onClick={() => router.push('/login')}
            className="w-full py-4 rounded-2xl bg-zinc-900/60 backdrop-blur-md border border-zinc-800 hover:border-pink-500/30 text-zinc-200 hover:text-white text-base font-semibold active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <span className="text-zinc-400 group-hover:text-pink-400 transition-colors">🔑</span> 
            I already have an account
          </button>
        </div>
      </div>
    </div>
  )
}