import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../lib/api'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { showToast } from '../components/ui/Toast'

export default function Calendar() {
  const [events, setEvents] = useState([])
  const [current, setCurrent] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', start_time: '', end_time: '', invite_email: '' })
  const [editId, setEditId] = useState(null)

  useEffect(() => { load() }, [current])

  async function load() {
    const month = format(current, 'yyyy-MM')
    const r = await api.get('/calendar', { params: { month } })
    setEvents(r.data)
  }

  async function save() {
    if (!form.title || !form.start_time) { showToast('Título e data são obrigatórios', 'error'); return }
    if (editId) {
      await api.patch(`/calendar/${editId}`, form)
    } else {
      await api.post('/calendar', form)
    }
    setModalOpen(false); setForm({ title: '', description: '', start_time: '', end_time: '', invite_email: '' }); setEditId(null)
    load(); showToast('Evento salvo')
  }

  async function sendInvite(id) {
    await api.post(`/calendar/${id}/invite`)
    showToast('Convite enviado!')
  }

  async function remove(id) {
    await api.delete(`/calendar/${id}`)
    load()
  }

  const days = eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) })
  const firstDow = startOfMonth(current).getDay()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1))} className="btn-secondary px-3 py-1.5 text-sm">&lt;</button>
          <h2 className="text-base font-semibold capitalize">{format(current, 'MMMM yyyy', { locale: ptBR })}</h2>
          <button onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1))} className="btn-secondary px-3 py-1.5 text-sm">&gt;</button>
        </div>
        <Button size="sm" onClick={() => { setEditId(null); setForm({ title: '', description: '', start_time: '', end_time: '', invite_email: '' }); setModalOpen(true) }}>+ Evento</Button>
      </div>
      <div className="card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} className="border-r border-b border-gray-50 min-h-[80px]" />)}
          {days.map(day => {
            const dayEvents = events.filter(e => isSameDay(parseISO(e.start_time), day))
            return (
              <div key={day.toISOString()} className="border-r border-b border-gray-100 min-h-[80px] p-1">
                <p className="text-xs text-gray-500 mb-1">{format(day, 'd')}</p>
                {dayEvents.map(ev => (
                  <div key={ev.id} className="bg-brand-100 text-brand-900 text-xs rounded px-1 py-0.5 mb-0.5 truncate cursor-pointer hover:bg-brand-200"
                    onClick={() => { setEditId(ev.id); setForm({ title: ev.title, description: ev.description || '', start_time: ev.start_time, end_time: ev.end_time || '', invite_email: ev.invite_email || '' }); setModalOpen(true) }}>
                    {ev.title}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Editar Evento' : 'Novo Evento'}>
        <div className="flex flex-col gap-3">
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título" className="input-field" />
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrição" className="input-field h-20 resize-none" />
          <div className="flex gap-2">
            <input type="datetime-local" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} className="input-field flex-1" />
            <input type="datetime-local" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} className="input-field flex-1" />
          </div>
          <input value={form.invite_email} onChange={e => setForm(f => ({ ...f, invite_email: e.target.value }))} placeholder="Email do convidado (opcional)" className="input-field" />
          <div className="flex gap-2 justify-end pt-2">
            {editId && form.invite_email && <Button variant="secondary" size="sm" onClick={() => sendInvite(editId)}>Enviar Convite</Button>}
            {editId && <Button variant="danger" size="sm" onClick={() => { remove(editId); setModalOpen(false) }}>Excluir</Button>}
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
