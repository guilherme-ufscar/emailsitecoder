import { formatDate, truncate } from '../../lib/utils'
import Spinner from '../ui/Spinner'

export default function MessageList({ messages, loading, selectedUid, onSelect }) {
  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>
  if (!messages.length) return <div className="text-center py-12 text-gray-400 text-sm">Nenhuma mensagem</div>

  return (
    <div className="divide-y divide-gray-100">
      {messages.map(msg => {
        const isRead = msg.flags?.includes('\Seen')
        const from = msg.from?.[0]
        const fromName = from?.name || from?.address || '?'
        return (
          <button
            key={msg.uid}
            onClick={() => onSelect(msg)}
            className={`w-full text-left px-4 py-3 hover:bg-brand-50 transition-colors ${selectedUid === msg.uid ? 'bg-brand-50 border-l-2 border-brand-900' : ''}`}
          >
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className={`text-sm truncate ${isRead ? 'text-gray-600' : 'font-semibold text-gray-900'}`}>{fromName}</span>
              <span className="text-xs text-gray-400 shrink-0">{formatDate(msg.date)}</span>
            </div>
            <p className={`text-sm truncate ${isRead ? 'text-gray-500' : 'font-medium text-gray-800'}`}>{msg.subject || '(sem assunto)'}</p>
            {msg.hasAttachment && <span className="text-xs text-gray-400">📎</span>}
          </button>
        )
      })}
    </div>
  )
}
