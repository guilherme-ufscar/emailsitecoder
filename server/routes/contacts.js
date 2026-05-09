const express = require('express')
const { getDb } = require('../config/db')
const { listMessages } = require('../services/imapService')
const auth = require('../middleware/auth')
const router = express.Router()

router.get('/', auth, (req, res) => {
  const db = getDb()
  const { q, group } = req.query
  let sql = 'SELECT * FROM contacts WHERE user_id = ?'
  const params = [req.user.id]
  if (q) { sql += ' AND (name LIKE ? OR email LIKE ?)'; params.push('%' + q + '%', '%' + q + '%') }
  if (group) { sql += ' AND group_name = ?'; params.push(group) }
  sql += ' ORDER BY name'
  res.json(db.prepare(sql).all(...params))
})

router.post('/', auth, (req, res) => {
  const { name, email, phone, company, group_name } = req.body
  if (!name || !email) return res.status(400).json({ error: 'name and email required' })
  const info = getDb().prepare('INSERT INTO contacts (user_id, name, email, phone, company, group_name) VALUES (?, ?, ?, ?, ?, ?)').run(req.user.id, name, email, phone || null, company || null, group_name || null)
  res.status(201).json(getDb().prepare('SELECT * FROM contacts WHERE id = ?').get(info.lastInsertRowid))
})

router.patch('/:id', auth, (req, res) => {
  const db = getDb()
  const c = db.prepare('SELECT * FROM contacts WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!c) return res.status(404).json({ error: 'Not found' })
  const { name, email, phone, company, group_name } = req.body
  db.prepare('UPDATE contacts SET name=COALESCE(?,name), email=COALESCE(?,email), phone=COALESCE(?,phone), company=COALESCE(?,company), group_name=COALESCE(?,group_name) WHERE id=?')
    .run(name ?? null, email ?? null, phone ?? null, company ?? null, group_name ?? null, req.params.id)
  res.json(db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id))
})

router.delete('/:id', auth, (req, res) => {
  getDb().prepare('DELETE FROM contacts WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
  res.json({ ok: true })
})

router.post('/harvest', auth, async (req, res, next) => {
  try {
    const db = getDb()
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
    user._password = req.headers['x-mail-password']
    const { messages } = await listMessages(user, 'Sent', 1, 200)
    let added = 0
    for (const msg of messages) {
      const recipients = [...(msg.to || []), ...(msg.cc || [])]
      for (const r of recipients) {
        if (!r.address) continue
        const exists = db.prepare('SELECT id FROM contacts WHERE user_id = ? AND email = ?').get(req.user.id, r.address)
        if (!exists) {
          db.prepare('INSERT INTO contacts (user_id, name, email, auto_added) VALUES (?, ?, ?, 1)').run(req.user.id, r.name || r.address, r.address)
          added++
        }
      }
    }
    res.json({ added })
  } catch (err) { next(err) }
})

module.exports = router
