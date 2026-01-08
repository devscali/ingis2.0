import { List, Grid3X3 } from 'lucide-react'

export function ViewToggle({ view, onChange }) {
  return (
    <div className="flex gap-1 p-1 glass rounded-xl">
      <button
        onClick={() => onChange('list')}
        className={`
          p-2 rounded-lg transition-all duration-200
          ${view === 'list' ? 'bg-orange-500 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}
        `}
      >
        <List className="w-5 h-5" />
      </button>
      <button
        onClick={() => onChange('grid')}
        className={`
          p-2 rounded-lg transition-all duration-200
          ${view === 'grid' ? 'bg-orange-500 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}
        `}
      >
        <Grid3X3 className="w-5 h-5" />
      </button>
    </div>
  )
}
