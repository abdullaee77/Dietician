'use client'

import { useEffect, useState, useRef } from 'react'

interface Props {
  messages: string[]
}

export default function RunningTicker({ messages }: Props) {
  const [index, setIndex] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const textRef = useRef<HTMLParagraphElement>(null)
  const [duration, setDuration] = useState(5)

  useEffect(() => {
    if (messages.length === 0) return

    // Calculate animation duration based on text length so longer messages
    // get more time to fully slide through instead of being cut off
    const textLength = messages[index]?.length ?? 0
    const calculatedDuration = Math.max(4, textLength * 0.09)
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
          ref={textRef}
          className="absolute text-rose-300 text-sm font-medium whitespace-nowrap animate-slide-through"
          style={{ animationDuration: `${duration}s` }}
        >
          {messages[index]}
        </p>
      </div>
      <style jsx>{`
        @keyframes slide-through {
          0% {
            transform: translateX(100vw);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(-100%);
            opacity: 0;
          }
        }
        .animate-slide-through {
          animation-name: slide-through;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  )
}