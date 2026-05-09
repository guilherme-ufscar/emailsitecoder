import { useState } from 'react'
import Button from '../ui/Button'

export default function Topbar({ onSearch, onCompose, title = '' }) {
  const [q, setQ] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    onSearch?.(q)
  }

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center gap-4 px-6 shrink-0">
      <h1 className="text-base font-semibold text-gray-900 min-w-0 truncate">{title}</h1>
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar emails..."
          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </form>
      <div className="ml-auto">
        {onCompose && (
          <Button onClick={onCompose} size="sm">
            + Novo Email
          </Button>
        )}
      </div>
    </header>
  )
}
