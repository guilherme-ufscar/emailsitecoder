const express = require('express')
const { getDb } = require('../config/db')
const { sendEmail } = require('../services/resendService')
const auth = require('../middleware/auth')
const router = express.Router()

router.get('/', auth, (req, res) => {
  const db = getDb()
  const { month } = req.query
  let rows
  if (month) {
    rows = db.prepare("SELECT * FROM events WHERE user_id = ? AND strftime('%Y-%m', start_time) = ? ORDER BY start_time").all(req.user.id, month)
  } else {
    rows = db.prepare('SELECT * FROM events WHERE user_id = ? ORDER BY start_time').all(req.user.id)
  }
  res.json(rows)
})

router.post('/', auth, (req, res) => {
  const { title, description, start_time, end_time, all_day, invite_email } = req.body
  if (!title || !start_time) return res.status(400).json({ error: 'title and start_time required' })
  const db = getDb()
  const info = db.prepare('INSERT INTO events (user_id, title, description, start_time, end_time, all_day, invite_email) VALUES (?, ?, ?, ?, ?, ?, ?)').run(req.user.id, title, description || null, start_time, end_time || null, all_day ? 1 : 0, invite_email || null)
  res.status(201).json(db.prepare('SELECT * FROM events WHERE id = ?').get(info.lastInsertRowid))
})

router.patch('/:id', auth, (req, res) => {
  const db = getDb()
  const ev = db.prepare('SELECT * FROM events WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!ev) return res.status(404).json({ error: 'Not found' })
  const { title, description, start_time, end_time, all_day, invite_email } = req.body
  db.prepare('UPDATE events SET title=COALESCE(?,title), description=COALESCE(?,description), start_time=COALESCE(?,start_time), end_time=COALESCE(?,end_time), all_day=COALESCE(?,all_day), invite_email=COALESCE(?,invite_email) WHERE id=?')
    .run(title ?? null, description ?? null, start_time ?? null, end_time ?? null, all_day ?? null, invite_email ?? null, req.params.id)
  res.json(db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id))
})

router.delete('/:id', auth, (req, res) => {
  getDb().prepare('DELETE FROM events WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
  res.json({ ok: true })
})

router.post('/:id/invite', auth, async (req, res, next) => {
  try {
    const db = getDb()
    const ev = db.prepare('SELECT * FROM events WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
    if (!ev || !ev.invite_email) return res.status(400).json({ error: 'No invite email set' })
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
    user._password = req.headers['x-mail-password']
    await sendEmail(user, {
      to: ev.invite_email,
      subject: 'Convite: ' + ev.title,
      html: '<p>Voce foi convidado para: <strong>' + ev.title + '</strong></p><p>Data: ' + ev.start_time + '</p>' + (ev.description ? '<p>' + ev.description + '</p>' : ''),
    })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

module.exports = router
