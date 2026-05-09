import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import SendMethodBadge from '../ui/SendMethodBadge'
import { showToast } from '../ui/Toast'
import api from '../../lib/api'

export default function ComposeModal({ open, onClose, defaultTo = '', defaultSubject = '', defaultBody = '' }) {
  const [to, setTo] = useState(defaultTo)
  const [cc, setCc] = useState('')
  const [subject, setSubject] = useState(defaultSubject)
  const [sending, setSending] = useState(false)
  const [sendMethod, setSendMethod] = useState(null)
  const [templates, setTemplates] = useState([])
  const [attachments, setAttachments] = useState([])

  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content: defaultBody,
    editorProps: {
      attributes: { class: 'min-h-[200px] focus:outline-none prose prose-sm max-w-none' },
    },
  })

  useEffect(() => {
    if (open) {
      api.get('/templates').then(r => setTemplates(r.data)).catch(() => {})
      setSendMethod(null)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    setTo(defaultTo); setSubject(defaultSubject)
    editor?.commands.setContent(defaultBody || '')
  }, [open, defaultTo, defaultSubject, defaultBody])

  async function handleSend() {
    if (!to || !subject) { showToast('Destinatário e assunto são obrigatórios', 'error'); return }
    setSending(true)
    try {
      const html = editor?.getHTML() || ''
      const r = await api.post('/compose/send', { to, cc: cc || undefined, subject, html })
      setSendMethod(r.data.method)
      showToast('Email enviado!')
      setTimeout(onClose, 2000)
    } catch (e) {
      showToast(e.response?.data?.error || 'Erro ao enviar', 'error')
    } finally { setSending(false) }
  }

  async function handleAttach(e) {
    const file = e.target.files[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    try {
      const r = await api.post('/attachments/upload', form)
      setAttachments(a => [...a, r.data])
      showToast('Arquivo anexado')
    } catch { showToast('Erro ao anexar arquivo', 'error') }
  }

  function applyTemplate(t) {
    setSubject(t.subject || subject)
    editor?.commands.setContent(t.body || '')
  }

  return (
    <Modal open={open} onClose={onClose} title="Novo Email" size="lg">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input value={to} onChange={e => setTo(e.target.value)} placeholder="Para" className="input-field flex-1" />
          <input value={cc} onChange={e => setCc(e.target.value)} placeholder="CC" className="input-field w-40" />
        </div>
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Assunto" className="input-field" />

        {templates.length > 0 && (
          <select onChange={e => { const t = templates.find(x => x.id == e.target.value); if (t) applyTemplate(t) }} className="input-field text-sm" defaultValue="">
            <option value="" disabled>Inserir template...</option>
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex gap-1 px-2 py-1.5 border-b border-gray-100 bg-gray-50">
            {[
              { label: 'B', action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive('bold') },
              { label: 'I', action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive('italic') },
              { label: 'Lista', action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive('bulletList') },
            ].map(btn => (
              <button key={btn.label} onClick={btn.action} className={`px-2 py-1 text-xs rounded transition-colors ${btn.active ? 'bg-brand-900 text-white' : 'hover:bg-gray-200 text-gray-700'}`}>{btn.label}</button>
            ))}
          </div>
          <div className="px-3 py-2">
            <EditorContent editor={editor} />
          </div>
        </div>

        {attachments.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {attachments.map(a => (
              <span key={a.id} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                📎 {a.name}
                <button onClick={() => setAttachments(x => x.filter(f => f.id !== a.id))} className="text-gray-400 hover:text-red-500 ml-1">&times;</button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <label className="cursor-pointer text-sm text-brand-700 hover:text-brand-900">
            📎 Anexar arquivo
            <input type="file" className="hidden" onChange={handleAttach} />
          </label>
          <div className="flex items-center gap-3">
            {sendMethod && <SendMethodBadge method={sendMethod} />}
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSend} disabled={sending}>{sending ? 'Enviando...' : 'Enviar'}</Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
