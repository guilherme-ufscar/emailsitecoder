const express = require('express')
const { getDb } = require('../config/db')
const imap = require('../services/imapService')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

function getUser(req, password) {
  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  user._password = password || req.headers['x-mail-password']
  return user
}

router.get('/folders', authMiddleware, async (req, res, next) => {
  try {
    const user = getUser(req)
    const folders = await imap.listFolders(user)
    res.json(folders)
  } catch (err) { next(err) }
})

router.get('/search', authMiddleware, async (req, res, next) => {
  try {
    const user = getUser(req)
    const messages = await imap.searchMessages(user, req.query.q || '')
    res.json(messages)
  } catch (err) { next(err) }
})

router.get('/:folder', authMiddleware, async (req, res, next) => {
  try {
    const user = getUser(req)
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const result = await imap.listMessages(user, decodeURIComponent(req.params.folder), page, limit)
    res.json(result)
  } catch (err) { next(err) }
})

router.get('/:folder/:uid', authMiddleware, async (req, res, next) => {
  try {
    const user = getUser(req)
    const msg = await imap.fetchMessage(user, decodeURIComponent(req.params.folder), parseInt(req.params.uid))
    if (!msg) return res.status(404).json({ error: 'Message not found' })
    res.json(msg)
  } catch (err) { next(err) }
})

router.post('/move', authMiddleware, async (req, res, next) => {
  try {
    const user = getUser(req)
    const { folder, uid, destination } = req.body
    await imap.moveMessage(user, folder, uid, destination)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.delete('/:folder/:uid', authMiddleware, async (req, res, next) => {
  try {
    const user = getUser(req)
    await imap.deleteMessage(user, decodeURIComponent(req.params.folder), parseInt(req.params.uid))
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.patch('/:folder/:uid/read', authMiddleware, async (req, res, next) => {
  try {
    const user = getUser(req)
    await imap.setReadFlag(user, decodeURIComponent(req.params.folder), parseInt(req.params.uid), req.body.read !== false)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

module.exports = router
