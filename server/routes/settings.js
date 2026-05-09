const express = require('express')
const bcrypt = require('bcryptjs')
const { getDb } = require('../config/db')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.get('/', authMiddleware, (req, res) => {
  const db = getDb()
  const user = db.prepare('SELECT id, email, display_name, signature, imap_host, imap_port, imap_secure, smtp_host, smtp_port, smtp_secure FROM users WHERE id = ?').get(req.user.id)
  const hasResend = !!db.prepare('SELECT resend_api_key FROM users WHERE id = ?').get(req.user.id)?.resend_api_key
  res.json({ ...user, has_resend_key: hasResend })
})

router.patch('/', authMiddleware, async (req, res, next) => {
  try {
    const db = getDb()
    const { display_name, signature, resend_api_key, password } = req.body
    const updates = []
    const values = []

    if (display_name !== undefined) { updates.push('display_name = ?'); values.push(display_name) }
    if (signature !== undefined) { updates.push('signature = ?'); values.push(signature) }
    if (resend_api_key !== undefined) { updates.push('resend_api_key = ?'); values.push(resend_api_key || null) }
    if (password) {
      const hash = await bcrypt.hash(password, 10)
      updates.push('password_hash = ?'); values.push(hash)
    }

    if (updates.length > 0) {
      values.push(req.user.id)
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values)
    }

    res.json({ ok: true })
  } catch (err) { next(err) }
})

module.exports = router
