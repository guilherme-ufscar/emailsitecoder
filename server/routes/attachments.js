const express = require('express')
const multer = require('multer')
const path = require('path')
const { UPLOAD_DIR } = require('../config/constants')
const { getDb } = require('../config/db')
const imap = require('../services/imapService')
const authMiddleware = require('../middleware/auth')

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } })

const router = express.Router()

router.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  res.json({ id: req.file.filename, name: req.file.originalname, size: req.file.size, path: req.file.path })
})

router.get('/:uid/:partId', authMiddleware, async (req, res, next) => {
  try {
    const db = getDb()
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
    user._password = req.headers['x-mail-password']
    const folder = req.query.folder || 'INBOX'
    const { buffer, type } = await imap.downloadAttachment(user, folder, parseInt(req.params.uid), req.params.partId)
    res.set('Content-Type', type || 'application/octet-stream')
    res.set('Content-Disposition', `attachment; filename="${req.query.filename || 'attachment'}"`)
    res.send(buffer)
  } catch (err) { next(err) }
})

module.exports = router
