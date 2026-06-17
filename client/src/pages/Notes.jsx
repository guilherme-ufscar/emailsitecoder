import { useState, useEffect } from 'react'
import { Pin, PinOff } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import api from '../lib/api'
import Button from '../components/ui/Button'
import { showToast } from '../components/ui/Toast'

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [selected, setSelected] = useState(null)
  const [title, setTitle] = useState('')
  const [q, setQ] = useState('')

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: { attributes: { class: 'min-h-[300px] focus:outline-none prose prose-sm max-w-none' } },
  })

  useEffect(() => { load() }, [])

  async function load(search = '') {
    const r = await api.get('/notes', { params: search ? { q: search } : {} })
    setNotes(r.data)
  }

  function selectNote(note) {
    setSelected(note)
    setTitle(note.title)
    editor?.commands.setContent(note.content || '')
  }

  function newNote() {
    setSelected(null)
    setTitle('')
    editor?.commands.setContent('')
  }

  async function save() {
    const content = editor?.getHTML() || ''
    if (selected) {
      await api.patch(`/notes/${selected.id}`, { title, content })
    } else {
      const r = await api.post('/notes', { title, content })
      setSelected(r.data)
    }
    showToast('Nota salva')
    load()
  }

  async function togglePin(note) {
    await api.patch(`/notes/${note.id}`, { pinned: !note.pinned })
    load()
  }

  async function remove(id) {
    await api.delete(`/notes/${id}`)
    if (selected?.id === id) newNote()
    load()
  }

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-gray-100 flex flex-col">
        <div className="p-3 border-b border-gray-100 flex gap-2">
          <input value={q} onChange={e => { setQ(e.target.value); load(e.target.value) }} placeholder="Buscar..." className="input-field flex-1 text-xs" />
          <Button size="sm" onClick={newNote}>+</Button>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {notes.map(n => (
            <button key={n.id} onClick={() => selectNote(n)} className={`w-full text-left px-3 py-2.5 hover:bg-brand-50 transition-colors ${selected?.id === n.id ? 'bg-brand-50' : ''}`}>
              <div className="flex items-center gap-1">
                {n.pinned ? <span className="text-yellow-500 text-xs">📌</span> : null}
                <p className="text-sm font-medium text-gray-900 truncate">{n.title || 'Sem título'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col p-6 gap-3">
        <div className="flex gap-3 items-center">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da nota" className="input-field flex-1 text-base font-medium" />
          {selected && <button onClick={() => togglePin(selected)} className="text-gray-400 hover:text-brand-900 transition-colors">{selected.pinned ? <PinOff size={18} /> : <Pin size={18} />}</button>}
          {selected && <button onClick={() => remove(selected.id)} className="text-gray-400 hover:text-red-500 text-sm">Excluir</button>}
          <Button onClick={save}>Salvar</Button>
        </div>
        <div className="card flex-1 overflow-auto p-4">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
