'use client'

import { useEffect, useState, useRef } from 'react'

interface Props {
  messages: string[]
}

export default function RunningTicker({ messages }: Props) {
  const [index, setIndex] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [duration, setDuration] = useState(10)

  useEffect(() => {
    if (messages.length === 0) return

    const textLength = messages[index]?.length ?? 0
    const calculatedDuration = Math.max(10, textLength * 0.22)
    setDuration(calculatedDuration)

    const timer = setTimeout(() => {
      setIndex(prev => (prev + 1) % messages.length)
      setAnimKey(prev => prev + 1)
    }, calculatedDuration * 1000)

    return () => clearTimeout(timer)
  }, [index, messages])

  if (messages.length === 0) return null

  return (
    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl overflow-hidden">
      <div className="relative h-12 flex items-center overflow-hidden">
        <p
          key={animKey}
          className="absolute text-rose-300 text-sm font-medium whitespace-nowrap"
          style={{
            animationName: 'tickerSlide',
            animationDuration: `${duration}s`,
            animationTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
            animationFillMode: 'forwards',
          }}
        >
          {messages[index]}
        </p>
      </div>
      <style>{`
        @keyframes tickerSlide {
          0% {
            transform: translateX(100vw);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          15% {
            transform: translateX(20px);
          }
          75% {
            transform: translateX(20px);
            opacity: 1;
          }
          92% {
            opacity: 1;
          }
          100% {
            transform: translateX(-100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}