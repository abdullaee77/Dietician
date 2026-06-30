'use client'

import { useEffect, useState } from 'react'

interface Props {
  messages: string[]
}

export default function RunningTicker({ messages }: Props) {
  const [index, setIndex] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    if (messages.length <= 1) return

    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % messages.length)
      setAnimKey(prev => prev + 1)
    }, 4500) // each message shows for 4.5s before sliding out

    return () => clearInterval(interval)
  }, [messages.length])

  if (messages.length === 0) return null

  return (
    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl overflow-hidden">
      <div className="relative h-12 flex items-center px-4 overflow-hidden">
        <p
          key={animKey}
          className="absolute text-rose-300 text-sm font-medium whitespace-nowrap animate-slide-through"
        >
          {messages[index]}
        </p>
      </div>
      <style jsx>{`
        @keyframes slide-through {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          15% {
            transform: translateX(0);
            opacity: 1;
          }
          85% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(-100%);
            opacity: 0;
          }
        }
        .animate-slide-through {
          animation: slide-through 4.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}