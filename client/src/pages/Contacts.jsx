import { useState, useEffect } from 'react'
import api from '../lib/api'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { initials } from '../lib/utils'
import { showToast } from '../components/ui/Toast'

export default function Contacts() {
  const [contacts, setContacts] = useState([])
  const [q, setQ] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', group_name: '' })
  const [editId, setEditId] = useState(null)
  const [harvesting, setHarvesting] = useState(false)

  useEffect(() => { load() }, [])

  async function load(search = '') {
    const r = await api.get('/contacts', { params: search ? { q: search } : {} })
    setContacts(r.data)
  }

  async function save() {
    if (!form.name || !form.email) { showToast('Nome e email são obrigatórios', 'error'); return }
    if (editId) {
      await api.patch(`/contacts/${editId}`, form)
    } else {
      await api.post('/contacts', form)
    }
    setModalOpen(false); setForm({ name: '', email: '', phone: '', company: '', group_name: '' }); setEditId(null)
    load(); showToast('Contato salvo')
  }

  async function remove(id) {
    await api.delete(`/contacts/${id}`)
    load()
  }

  async function harvest() {
    setHarvesting(true)
    try {
      const r = await api.post('/contacts/harvest')
      showToast(`${r.data.added} novos contatos adicionados`)
      load()
    } catch { showToast('Erro ao importar contatos', 'error') }
    finally { setHarvesting(false) }
  }

  function openEdit(c) {
    setEditId(c.id)
    setForm({ name: c.name, email: c.email, phone: c.phone || '', company: c.company || '', group_name: c.group_name || '' })
    setModalOpen(true)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex gap-3 mb-6">
        <input value={q} onChange={e => { setQ(e.target.value); load(e.target.value) }} placeholder="Buscar contatos..." className="input-field flex-1" />
        <Button variant="secondary" onClick={harvest} disabled={harvesting}>{harvesting ? 'Importando...' : 'Importar do Email'}</Button>
        <Button onClick={() => { setEditId(null); setForm({ name: '', email: '', phone: '', company: '', group_name: '' }); setModalOpen(true) }}>+ Contato</Button>
      </div>
      <div className="card divide-y divide-gray-100">
        {contacts.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">Nenhum contato</p>}
        {contacts.map(c => (
          <div key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-brand-50 transition-colors">
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-900 flex items-center justify-center text-sm font-semibold shrink-0">
              {initials(c.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{c.name}</p>
              <p className="text-xs text-gray-500">{c.email}{c.company ? ` · ${c.company}` : ''}</p>
            </div>
            {c.auto_added ? <span className="text-xs text-gray-400">auto</span> : null}
            <button onClick={() => openEdit(c)} className="text-xs text-brand-700 hover:text-brand-900">Editar</button>
            <button onClick={() => remove(c.id)} className="text-gray-300 hover:text-red-500 text-lg leading-none">&times;</button>
          </div>
        ))}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Editar Contato' : 'Novo Contato'}>
        <div className="flex flex-col gap-3">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome" className="input-field" />
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="input-field" />
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Telefone" className="input-field" />
          <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Empresa" className="input-field" />
          <input value={form.group_name} onChange={e => setForm(f => ({ ...f, group_name: e.target.value }))} placeholder="Grupo" className="input-field" />
          <div className="flex gap-2 justify-end pt-2">
            {editId && <Button variant="danger" size="sm" onClick={() => { remove(editId); setModalOpen(false) }}>Excluir</Button>}
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
