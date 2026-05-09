const express = require('express')
const { getDb } = require('../config/db')
const auth = require('../middleware/auth')
const router = express.Router()

router.get('/', auth, (req, res) => {
  const rows = getDb().prepare('SELECT * FROM todos WHERE user_id = ? ORDER BY completed ASC, due_date ASC, created_at DESC').all(req.user.id)
  res.json(rows)
})

router.post('/', auth, (req, res) => {
  const { title, description, due_date, priority } = req.body
  if (!title) return res.status(400).json({ error: 'title required' })
  const db = getDb()
  const info = db.prepare('INSERT INTO todos (user_id, title, description, due_date, priority) VALUES (?, ?, ?, ?, ?)').run(req.user.id, title, description || null, due_date || null, priority || 'medium')
  res.status(201).json(db.prepare('SELECT * FROM todos WHERE id = ?').get(info.lastInsertRowid))
})

router.patch('/:id', auth, (req, res) => {
  const { title, description, due_date, priority, completed } = req.body
  const db = getDb()
  const todo = db.prepare('SELECT * FROM todos WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!todo) return res.status(404).json({ error: 'Not found' })
  db.prepare('UPDATE todos SET title=COALESCE(?,title), description=COALESCE(?,description), due_date=COALESCE(?,due_date), priority=COALESCE(?,priority), completed=COALESCE(?,completed) WHERE id=?')
    .run(title ?? null, description ?? null, due_date ?? null, priority ?? null, completed !== undefined ? (completed ? 1 : 0) : null, req.params.id)
  res.json(db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id))
})

router.delete('/:id', auth, (req, res) => {
  getDb().prepare('DELETE FROM todos WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
  res.json({ ok: true })
})

module.exports = router
