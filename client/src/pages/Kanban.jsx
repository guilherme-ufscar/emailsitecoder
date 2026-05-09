import { useState, useEffect } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import api from '../lib/api'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { showToast } from '../components/ui/Toast'

function KanbanCard({ card, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="bg-white border border-gray-200 rounded-lg p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow"
      onClick={() => onEdit(card)}>
      <p className="text-sm font-medium text-gray-900">{card.title}</p>
      {card.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{card.description}</p>}
      {card.due_date && <p className="text-xs text-brand-700 mt-1">{card.due_date}</p>}
    </div>
  )
}

export default function Kanban() {
  const [columns, setColumns] = useState([])
  const [cards, setCards] = useState([])
  const [cardModal, setCardModal] = useState(false)
  const [cardForm, setCardForm] = useState({ title: '', description: '', due_date: '', column_id: '' })
  const [editCardId, setEditCardId] = useState(null)
  const [newColTitle, setNewColTitle] = useState('')
  const sensors = useSensors(useSensor(PointerSensor))

  useEffect(() => { load() }, [])

  async function load() {
    const r = await api.get('/kanban')
    setColumns(r.data.columns)
    setCards(r.data.cards)
  }

  async function addColumn() {
    if (!newColTitle.trim()) return
    await api.post('/kanban/columns', { title: newColTitle })
    setNewColTitle(''); load()
  }

  async function deleteColumn(id) {
    await api.delete(`/kanban/columns/${id}`)
    load()
  }

  function openNewCard(columnId) {
    setEditCardId(null)
    setCardForm({ title: '', description: '', due_date: '', column_id: columnId })
    setCardModal(true)
  }

  function openEditCard(card) {
    setEditCardId(card.id)
    setCardForm({ title: card.title, description: card.description || '', due_date: card.due_date || '', column_id: card.column_id })
    setCardModal(true)
  }

  async function saveCard() {
    if (!cardForm.title.trim()) { showToast('Título obrigatório', 'error'); return }
    if (editCardId) {
      await api.patch(`/kanban/cards/${editCardId}`, cardForm)
    } else {
      await api.post('/kanban/cards', cardForm)
    }
    setCardModal(false); load()
  }

  async function deleteCard(id) {
    await api.delete(`/kanban/cards/${id}`)
    setCardModal(false); load()
  }

  async function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const activeCard = cards.find(c => c.id === active.id)
    const overCard = cards.find(c => c.id === over.id)
    if (!activeCard) return
    const newColumnId = overCard ? overCard.column_id : active.data?.current?.columnId
    await api.patch(`/kanban/cards/${active.id}`, { column_id: newColumnId || activeCard.column_id })
    load()
  }

  return (
    <div className="p-6 overflow-x-auto">
      <div className="flex gap-4 min-w-max">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {columns.map(col => {
            const colCards = cards.filter(c => c.column_id === col.id)
            return (
              <div key={col.id} className="w-72 bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">{col.title}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => openNewCard(col.id)} className="text-brand-700 hover:text-brand-900 text-lg leading-none">+</button>
                    <button onClick={() => deleteColumn(col.id)} className="text-gray-300 hover:text-red-500 text-sm leading-none ml-1">&times;</button>
                  </div>
                </div>
                <SortableContext items={colCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  {colCards.map(card => <KanbanCard key={card.id} card={card} onEdit={openEditCard} />)}
                </SortableContext>
                <button onClick={() => openNewCard(col.id)} className="text-xs text-gray-400 hover:text-brand-700 py-1 text-left">+ Adicionar card</button>
              </div>
            )
          })}
        </DndContext>
        <div className="w-72 bg-gray-50 rounded-xl p-3 flex flex-col gap-2 h-fit">
          <input value={newColTitle} onChange={e => setNewColTitle(e.target.value)} placeholder="Nova coluna..." className="input-field text-sm" onKeyDown={e => e.key === 'Enter' && addColumn()} />
          <Button size="sm" onClick={addColumn}>Adicionar coluna</Button>
        </div>
      </div>
      <Modal open={cardModal} onClose={() => setCardModal(false)} title={editCardId ? 'Editar Card' : 'Novo Card'}>
        <div className="flex flex-col gap-3">
          <input value={cardForm.title} onChange={e => setCardForm(f => ({ ...f, title: e.target.value }))} placeholder="Título" className="input-field" />
          <textarea value={cardForm.description} onChange={e => setCardForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrição" className="input-field h-24 resize-none" />
          <input type="date" value={cardForm.due_date} onChange={e => setCardForm(f => ({ ...f, due_date: e.target.value }))} className="input-field" />
          <div className="flex gap-2 justify-end pt-2">
            {editCardId && <Button variant="danger" size="sm" onClick={() => deleteCard(editCardId)}>Excluir</Button>}
            <Button variant="secondary" onClick={() => setCardModal(false)}>Cancelar</Button>
            <Button onClick={saveCard}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
