const express = require('express')
const { getDb } = require('../config/db')
const { sendEmail } = require('../services/resendService')
const { appendToSent } = require('../services/imapService')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.post('/send', authMiddleware, async (req, res, next) => {
  try {
    const db = getDb()
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
    user._password = req.headers['x-mail-password']

    const { to, cc, bcc, subject, html, text, attachments } = req.body
    if (!to || !subject) return res.status(400).json({ error: 'to and subject are required' })

    const message = {
      from: `${user.display_name || user.email} <${user.email}>`,
      to, cc, bcc, subject, html, text,
      attachments: attachments || [],
    }

    const result = await sendEmail(user, message)
    res.json({ ok: true, method: result.method, messageId: result.messageId })
  } catch (err) { next(err) }
})

router.post('/draft', authMiddleware, async (req, res, next) => {
  try {
    const db = getDb()
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
    user._password = req.headers['x-mail-password']

    const { to, subject, html } = req.body
    const nodemailer = require('nodemailer')
    const raw = await new Promise((resolve, reject) => {
      const mail = nodemailer.createTransport({ streamTransport: true })
      mail.sendMail({ from: user.email, to, subject, html }, (err, info) => {
        if (err) return reject(err)
        const chunks = []
        info.message.on('data', c => chunks.push(c))
        info.message.on('end', () => resolve(Buffer.concat(chunks)))
      })
    })
    await appendToSent(user, raw)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

module.exports = router
