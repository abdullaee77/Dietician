'use client'

import { useState, useEffect } from 'react'

interface Props {
  label: string
  emoji: string
  food: string
  time: string
  skipped: boolean
  onFoodChange: (v: string) => void
  onTimeChange: (v: string) => void
  onSkipChange: (v: boolean) => void
  onRemove?: () => void
  isExtra?: boolean
}

export default function MealCard({
  label, emoji, food, time, skipped,
  onFoodChange, onTimeChange, onSkipChange,
  onRemove, isExtra = false
}: Props) {
  const [hour, setHour] = useState('12')
  const [minute, setMinute] = useState('00')
  const [ampm, setAmpm] = useState('AM')

  useEffect(() => {
    if (!time) return
    const [h, m] = time.split(':')
    let hNum = parseInt(h)
    const period = hNum >= 12 ? 'PM' : 'AM'
    if (hNum > 12) hNum -= 12
    if (hNum === 0) hNum = 12
    setHour(String(hNum))
    setMinute(m ?? '00')
    setAmpm(period)
  }, [])

  function update(h: string, m: string, period: string) {
    let hNum = parseInt(h)
    if (period === 'PM' && hNum !== 12) hNum += 12
    if (period === 'AM' && hNum === 12) hNum = 0
    onTimeChange(`${String(hNum).padStart(2, '0')}:${m}`)
  }

  function handleHour(val: string) {
    if (val === '') { setHour(''); return }
    const num = parseInt(val)
    if (isNaN(num) || num < 1 || num > 12) return
    setHour(String(num))
    update(String(num), minute, ampm)
  }

  function handleMinute(val: string) {
    if (val.length > 2) return
    if (val === '') { setMinute(''); return }
    const num = parseInt(val)
    if (isNaN(num) || num < 0 || num > 59) return
    setMinute(val)
    update(hour, val.padStart(2, '0'), ampm)
  }

  function handleAmpm(val: string) {
    setAmpm(val)
    update(hour, minute, val)
  }

  return (
    <div className={`rounded-2xl p-4 border transition-all ${
      skipped
        ? 'bg-zinc-900/50 border-zinc-800 opacity-60'
        : 'bg-zinc-900 border-zinc-800'
    }`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <h3 className={`font-semibold ${skipped ? 'text-zinc-500 line-through' : 'text-white'}`}>
            {label}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {/* Skip toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Skip</span>
            <button
              onClick={() => onSkipChange(!skipped)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                skipped ? 'bg-zinc-600' : 'bg-zinc-700'
              }`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                skipped
                  ? 'left-5 bg-zinc-400'
                  : 'left-0.5 bg-rose-500'
              }`} />
            </button>
          </div>
          {/* Remove button for extra meals */}
          {isExtra && onRemove && (
            <button onClick={onRemove} className="text-zinc-600 hover:text-red-400 text-lg leading-none">
              ×
            </button>
          )}
        </div>
      </div>

      {/* Content — hidden when skipped */}
      {!skipped && (
        <>
          <textarea
            value={food}
            onChange={e => onFoodChange(e.target.value)}
            placeholder={`What did you have for ${label.toLowerCase()}?`}
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-rose-500 transition mb-3"
          />

          <p className="text-xs text-zinc-500 font-medium mb-2">What time?</p>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                type="number"
                value={hour}
                onChange={e => handleHour(e.target.value)}
                placeholder="12"
                min={1} max={12}
                className="w-full text-center px-2 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              />
              <p className="text-center text-xs text-zinc-600 mt-1">Hour</p>
            </div>
            <span className="text-zinc-600 font-bold text-xl mb-4">:</span>
            <div className="flex-1">
              <input
                type="number"
                value={minute}
                onChange={e => handleMinute(e.target.value)}
                placeholder="00"
                min={0} max={59}
                className="w-full text-center px-2 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              />
              <p className="text-center text-xs text-zinc-600 mt-1">Min</p>
            </div>
            <div className="flex flex-col gap-1 mb-4">
              {['AM', 'PM'].map(p => (
                <button key={p} onClick={() => handleAmpm(p)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition active:scale-95 ${
                    ampm === p
                      ? 'bg-rose-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {skipped && (
        <p className="text-xs text-zinc-600 mt-1">Marked as skipped today</p>
      )}
    </div>
  )
}