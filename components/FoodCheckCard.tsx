'use client'

interface Food {
  name: string
  reason: string
}

interface Props {
  skipFoods: Food[]
  mustEatFoods: Food[]
  getCompliance: (name: string, type: string) => boolean | null
  onToggle: (name: string, type: string, complied: boolean) => void
}

export default function FoodCheckCard({
  skipFoods, mustEatFoods, getCompliance, onToggle
}: Props) {
  if (skipFoods.length === 0 && mustEatFoods.length === 0) return null

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-zinc-800">
        <h3 className="font-semibold text-white text-sm">📋 Today's Food Check</h3>
        <p className="text-xs text-zinc-500 mt-0.5">Quick check-in on your food plan</p>
      </div>

      <div className="divide-y divide-zinc-800">

        {skipFoods.map(food => {
          const complied = getCompliance(food.name, 'skip')
          return (
            <div key={`skip-${food.name}`} className="px-4 py-3 flex items-center gap-3">
              <span className="text-base shrink-0">🚫</span>
              <div className="flex-1 min-w-0">
                <p className="text-zinc-200 text-sm font-medium truncate">{food.name}</p>
                <p className="text-zinc-500 text-xs truncate">Skip this</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => onToggle(food.name, 'skip', true)}
                  aria-label="Yes, skipped"
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition active:scale-90 flex items-center justify-center ${
                    complied === true
                      ? 'bg-green-500 text-white'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  ✓
                </button>
                <button
                  onClick={() => onToggle(food.name, 'skip', false)}
                  aria-label="No, did not skip"
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition active:scale-90 flex items-center justify-center ${
                    complied === false
                      ? 'bg-red-500 text-white'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  ✕
                </button>
              </div>
            </div>
          )
        })}

        {mustEatFoods.map(food => {
          const complied = getCompliance(food.name, 'must')
          return (
            <div key={`must-${food.name}`} className="px-4 py-3 flex items-center gap-3">
              <span className="text-base shrink-0">✅</span>
              <div className="flex-1 min-w-0">
                <p className="text-zinc-200 text-sm font-medium truncate">{food.name}</p>
                <p className="text-zinc-500 text-xs truncate">Make sure to eat this</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => onToggle(food.name, 'must', true)}
                  aria-label="Yes, ate it"
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition active:scale-90 flex items-center justify-center ${
                    complied === true
                      ? 'bg-green-500 text-white'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  ✓
                </button>
                <button
                  onClick={() => onToggle(food.name, 'must', false)}
                  aria-label="No, did not eat it"
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition active:scale-90 flex items-center justify-center ${
                    complied === false
                      ? 'bg-red-500 text-white'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  ✕
                </button>
              </div>
            </div>
          )
        })}

      </div>
    </div>
  )
}