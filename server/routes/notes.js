const express = require('express')
const { getDb } = require('../config/db')
const auth = require('../middleware/auth')
const router = express.Router()

router.get('/', auth, (req, res) => {
  const db = getDb()
  const { q } = req.query
  let rows
  if (q) {
    rows = db.prepare("SELECT * FROM notes WHERE user_id = ? AND (title LIKE ? OR content LIKE ?) ORDER BY pinned DESC, updated_at DESC").all(req.user.id, `%${q}%`, `%${q}%`)
  } else {
    rows = db.prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY pinned DESC, updated_at DESC').all(req.user.id)
  }
  res.json(rows)
})

router.post('/', auth, (req, res) => {
  const { title, content, pinned } = req.body
  const info = getDb().prepare('INSERT INTO notes (user_id, title, content, pinned) VALUES (?, ?, ?, ?)').run(req.user.id, title || '', content || '', pinned ? 1 : 0)
  res.status(201).json(getDb().prepare('SELECT * FROM notes WHERE id = ?').get(info.lastInsertRowid))
})

router.patch('/:id', auth, (req, res) => {
  const db = getDb()
  const note = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!note) return res.status(404).json({ error: 'Not found' })
  const { title, content, pinned } = req.body
  db.prepare("UPDATE notes SET title=COALESCE(?,title), content=COALESCE(?,content), pinned=COALESCE(?,pinned), updated_at=datetime('now') WHERE id=?")
    .run(title ?? null, content ?? null, pinned ?? null, req.params.id)
  res.json(db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id))
})

router.delete('/:id', auth, (req, res) => {
  getDb().prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
  res.json({ ok: true })
})

module.exports = router
