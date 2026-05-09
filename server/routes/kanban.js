const express = require('express')
const { getDb } = require('../config/db')
const auth = require('../middleware/auth')
const router = express.Router()

router.get('/', auth, (req, res) => {
  const db = getDb()
  const columns = db.prepare('SELECT * FROM kanban_columns WHERE user_id = ? ORDER BY position').all(req.user.id)
  const cards = db.prepare('SELECT kc.* FROM kanban_cards kc JOIN kanban_columns col ON kc.column_id = col.id WHERE col.user_id = ? ORDER BY kc.position').all(req.user.id)
  res.json({ columns, cards })
})

router.post('/columns', auth, (req, res) => {
  const { title } = req.body
  if (!title) return res.status(400).json({ error: 'title required' })
  const db = getDb()
  const maxPos = db.prepare('SELECT MAX(position) as m FROM kanban_columns WHERE user_id = ?').get(req.user.id)?.m ?? -1
  const info = db.prepare('INSERT INTO kanban_columns (user_id, title, position) VALUES (?, ?, ?)').run(req.user.id, title, maxPos + 1)
  res.status(201).json(db.prepare('SELECT * FROM kanban_columns WHERE id = ?').get(info.lastInsertRowid))
})

router.patch('/columns/:id', auth, (req, res) => {
  const db = getDb()
  const col = db.prepare('SELECT * FROM kanban_columns WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!col) return res.status(404).json({ error: 'Not found' })
  const { title, position } = req.body
  db.prepare('UPDATE kanban_columns SET title=COALESCE(?,title), position=COALESCE(?,position) WHERE id=?').run(title ?? null, position ?? null, req.params.id)
  res.json(db.prepare('SELECT * FROM kanban_columns WHERE id = ?').get(req.params.id))
})

router.delete('/columns/:id', auth, (req, res) => {
  getDb().prepare('DELETE FROM kanban_columns WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
  res.json({ ok: true })
})

router.post('/cards', auth, (req, res) => {
  const { column_id, title, description, due_date } = req.body
  if (!column_id || !title) return res.status(400).json({ error: 'column_id and title required' })
  const db = getDb()
  const col = db.prepare('SELECT * FROM kanban_columns WHERE id = ? AND user_id = ?').get(column_id, req.user.id)
  if (!col) return res.status(403).json({ error: 'Column not found' })
  const maxPos = db.prepare('SELECT MAX(position) as m FROM kanban_cards WHERE column_id = ?').get(column_id)?.m ?? -1
  const info = db.prepare('INSERT INTO kanban_cards (column_id, title, description, position, due_date) VALUES (?, ?, ?, ?, ?)').run(column_id, title, description || null, maxPos + 1, due_date || null)
  res.status(201).json(db.prepare('SELECT * FROM kanban_cards WHERE id = ?').get(info.lastInsertRowid))
})

router.patch('/cards/:id', auth, (req, res) => {
  const db = getDb()
  const card = db.prepare('SELECT kc.* FROM kanban_cards kc JOIN kanban_columns col ON kc.column_id = col.id WHERE kc.id = ? AND col.user_id = ?').get(req.params.id, req.user.id)
  if (!card) return res.status(404).json({ error: 'Not found' })
  const { title, description, position, column_id, due_date } = req.body
  db.prepare('UPDATE kanban_cards SET title=COALESCE(?,title), description=COALESCE(?,description), position=COALESCE(?,position), column_id=COALESCE(?,column_id), due_date=COALESCE(?,due_date) WHERE id=?')
    .run(title ?? null, description ?? null, position ?? null, column_id ?? null, due_date ?? null, req.params.id)
  res.json(db.prepare('SELECT * FROM kanban_cards WHERE id = ?').get(req.params.id))
})

router.delete('/cards/:id', auth, (req, res) => {
  const db = getDb()
  const card = db.prepare('SELECT kc.* FROM kanban_cards kc JOIN kanban_columns col ON kc.column_id = col.id WHERE kc.id = ? AND col.user_id = ?').get(req.params.id, req.user.id)
  if (!card) return res.status(404).json({ error: 'Not found' })
  db.prepare('DELETE FROM kanban_cards WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
