'use client'

import { useState, useEffect } from 'react'

interface Props {
  label: string
  value: string
  onChange: (v: string) => void
}

export default function SleepTimePicker({ label, value, onChange }: Props) {
  const [hour, setHour] = useState('10')
  const [minute, setMinute] = useState('00')
  const [ampm, setAmpm] = useState('PM')

  useEffect(() => {
    if (!value) return
    const [h, m] = value.split(':')
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
    if (!hNum) return
    if (period === 'PM' && hNum !== 12) hNum += 12
    if (period === 'AM' && hNum === 12) hNum = 0
    onChange(`${String(hNum).padStart(2, '0')}:${m}`)
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
    <div>
      <label className="text-xs text-zinc-500 mb-2 block">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            type="number"
            value={hour}
            onChange={e => handleHour(e.target.value)}
            placeholder="10"
            min={1} max={12}
            className="w-full text-center px-2 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white text-base font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          />
          <p className="text-center text-xs text-zinc-600 mt-1">Hour</p>
        </div>
        <span className="text-zinc-600 font-bold text-lg mb-4">:</span>
        <div className="flex-1">
          <input
            type="number"
            value={minute}
            onChange={e => handleMinute(e.target.value)}
            placeholder="00"
            min={0} max={59}
            className="w-full text-center px-2 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white text-base font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          />
          <p className="text-center text-xs text-zinc-600 mt-1">Min</p>
        </div>
        <div className="flex flex-col gap-1 mb-4">
          {['AM', 'PM'].map(p => (
            <button key={p} onClick={() => handleAmpm(p)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition active:scale-95 ${
                ampm === p
                  ? 'bg-rose-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}