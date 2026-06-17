import { useState } from 'react'
import { Search, PenSquare } from 'lucide-react'

export default function Topbar({ onSearch, onCompose, title = '' }) {
  const [q, setQ] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    onSearch?.(q)
  }

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center gap-4 px-6 shrink-0">
      <h1 className="text-base font-semibold text-gray-900 min-w-0 truncate">{title}</h1>
      <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar emails..."
          className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </form>
      <div className="ml-auto">
        {onCompose && (
          <button
            onClick={onCompose}
            className="flex items-center gap-2 bg-brand-900 hover:bg-brand-800 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <PenSquare size={15} strokeWidth={1.75} />
            Novo Email
          </button>
        )}
      </div>
    </header>
  )
}
