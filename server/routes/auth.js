const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getDb } = require('../config/db')
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants')
const { detectPorts } = require('../services/portDetector')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.post('/login', async (req, res, next) => {
  try {
    const { email, password, host } = req.body
    if (!email || !password || !host) {
      return res.status(400).json({ error: 'email, password and host are required' })
    }

    const db = getDb()
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)

    if (!user) {
      // First login — create user, detect ports
      const hash = await bcrypt.hash(password, 10)
      const { imap, smtp } = await detectPorts(host, email, password)
      const info = db.prepare(`
        INSERT INTO users (email, password_hash, imap_host, imap_port, imap_secure, smtp_host, smtp_port, smtp_secure)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(email, hash, host, imap.port, imap.secure, host, smtp.port, smtp.secure)
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)
    } else {
      const valid = await bcrypt.compare(password, user.password_hash)
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

      // Re-detect ports if not cached
      if (!user.imap_port) {
        const { imap, smtp } = await detectPorts(host, email, password)
        db.prepare(`
          UPDATE users SET imap_host=?, imap_port=?, imap_secure=?, smtp_host=?, smtp_port=?, smtp_secure=? WHERE id=?
        `).run(host, imap.port, imap.secure, host, smtp.port, smtp.secure, user.id)
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id)
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    // Store session
    const crypto = require('crypto')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    db.prepare('INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)').run(user.id, tokenHash, expiresAt)

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        imap_port: user.imap_port,
        smtp_port: user.smtp_port,
      }
    })
  } catch (err) {
    next(err)
  }
})

router.post('/logout', authMiddleware, (req, res) => {
  const db = getDb()
  const header = req.headers.authorization
  const token = header.slice(7)
  const crypto = require('crypto')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash)
  res.json({ ok: true })
})

router.get('/verify', authMiddleware, (req, res) => {
  const db = getDb()
  const user = db.prepare('SELECT id, email, display_name, imap_port, smtp_port FROM users WHERE id = ?').get(req.user.id)
  res.json({ user })
})

module.exports = router
