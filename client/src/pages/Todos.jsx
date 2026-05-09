import { useState, useEffect } from 'react'
import api from '../lib/api'
import { formatDate, priorityColor } from '../lib/utils'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { showToast } from '../components/ui/Toast'

export default function Todos() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const r = await api.get('/todos')
    setTodos(r.data)
  }

  async function add(e) {
    e.preventDefault()
    if (!title.trim()) return
    await api.post('/todos', { title, priority, due_date: dueDate || undefined })
    setTitle(''); setDueDate('')
    load()
  }

  async function toggle(todo) {
    await api.patch(`/todos/${todo.id}`, { completed: !todo.completed })
    load()
  }

  async function remove(id) {
    await api.delete(`/todos/${id}`)
    load()
  }

  const priorityLabels = { low: 'Baixa', medium: 'Média', high: 'Alta' }
  const priorityBadge = { low: 'green', medium: 'yellow', high: 'red' }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={add} className="card p-4 mb-6 flex gap-3 flex-wrap">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nova tarefa..." className="input-field flex-1 min-w-40" />
        <select value={priority} onChange={e => setPriority(e.target.value)} className="input-field w-32">
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
        </select>
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-field w-40" />
        <Button type="submit">Adicionar</Button>
      </form>
      <div className="card divide-y divide-gray-100">
        {todos.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">Nenhuma tarefa</p>}
        {todos.map(todo => (
          <div key={todo.id} className="flex items-center gap-3 px-4 py-3">
            <input type="checkbox" checked={!!todo.completed} onChange={() => toggle(todo)} className="w-4 h-4 accent-brand-900" />
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${todo.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{todo.title}</p>
              {todo.due_date && <p className="text-xs text-gray-400">{formatDate(todo.due_date)}</p>}
            </div>
            <Badge color={priorityBadge[todo.priority]}>{priorityLabels[todo.priority]}</Badge>
            <button onClick={() => remove(todo.id)} className="text-gray-300 hover:text-red-500 text-lg leading-none">&times;</button>
          </div>
        ))}
      </div>
    </div>
  )
}
