const express = require('express')
const { getDb } = require('../config/db')
const auth = require('../middleware/auth')
const router = express.Router()

router.get('/', auth, (req, res) => {
  res.json(getDb().prepare('SELECT * FROM templates WHERE user_id = ? ORDER BY name').all(req.user.id))
})

router.post('/', auth, (req, res) => {
  const { name, subject, body } = req.body
  if (!name || !body) return res.status(400).json({ error: 'name and body required' })
  const info = getDb().prepare('INSERT INTO templates (user_id, name, subject, body) VALUES (?, ?, ?, ?)').run(req.user.id, name, subject || null, body)
  res.status(201).json(getDb().prepare('SELECT * FROM templates WHERE id = ?').get(info.lastInsertRowid))
})

router.patch('/:id', auth, (req, res) => {
  const db = getDb()
  const t = db.prepare('SELECT * FROM templates WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!t) return res.status(404).json({ error: 'Not found' })
  const { name, subject, body } = req.body
  db.prepare('UPDATE templates SET name=COALESCE(?,name), subject=COALESCE(?,subject), body=COALESCE(?,body) WHERE id=?').run(name ?? null, subject ?? null, body ?? null, req.params.id)
  res.json(db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id))
})

router.delete('/:id', auth, (req, res) => {
  getDb().prepare('DELETE FROM templates WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
  res.json({ ok: true })
})

module.exports = router
