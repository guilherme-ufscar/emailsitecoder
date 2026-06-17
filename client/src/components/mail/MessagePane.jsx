import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'
import { Paperclip } from 'lucide-react'
import { formatDateTime } from '../../lib/utils'
import Spinner from '../ui/Spinner'
import Button from '../ui/Button'
import api from '../../lib/api'

export default function MessagePane({ folder, uid, onClose }) {
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!uid || !folder) return
    setLoading(true)
    api.get(`/mail/${encodeURIComponent(folder)}/${uid}`)
      .then(r => setMsg(r.data))
      .finally(() => setLoading(false))
  }, [folder, uid])

  if (!uid) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Selecione um email</div>
  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>
  if (!msg) return null

  const from = msg.envelope?.from?.[0]
  const safeHtml = msg.html ? DOMPurify.sanitize(msg.html) : `<pre class="whitespace-pre-wrap text-sm">${msg.text || ''}</pre>`

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900 mb-2">{msg.envelope?.subject || '(sem assunto)'}</h2>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{from?.name || from?.address}</span>
            {from?.name && <span className="text-gray-400 ml-1">&lt;{from.address}&gt;</span>}
          </div>
          <span className="text-xs text-gray-400">{formatDateTime(msg.envelope?.date)}</span>
        </div>
      </div>
      {msg.attachments?.length > 0 && (
        <div className="px-6 py-2 border-b border-gray-100 flex gap-2 flex-wrap">
          {msg.attachments.map(att => (
            <a
              key={att.partId}
              href={`/api/attachments/${uid}/${att.partId}?folder=${encodeURIComponent(folder)}&filename=${encodeURIComponent(att.filename)}`}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-700 transition-colors"
              download={att.filename}
            >
              <Paperclip size={12} /> {att.filename}
            </a>
          ))}
        </div>
      )}
      <div
        className="flex-1 overflow-auto px-6 py-4 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </div>
  )
}
