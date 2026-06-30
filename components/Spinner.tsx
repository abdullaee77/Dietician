'use client'

interface Props {
  label?: string
}

export default function Spinner({ label }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
        <div className="absolute inset-0 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
      </div>
      {label && <p className="text-zinc-500 text-sm">{label}</p>}
    </div>
  )
}